import { HistoricalEarthquakeRepository } from "@application/interfaces/repositories";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { Earthquake } from "@domain/entities/earthquake";
import { Dependencies } from "@infrastructure/dependencies";

export class DynamoDBEarthquakeRepository implements HistoricalEarthquakeRepository {
  private readonly docClient: DynamoDBDocumentClient;
  private readonly dependencies: Pick<Dependencies, "config" | "logger">;

  constructor(dependencies: Pick<Dependencies, "config" | "logger">) {
    this.dependencies = dependencies;
    this.docClient = DynamoDBDocumentClient.from(
      new DynamoDBClient({
        region: dependencies.config.aws.region,
      }),
    );
  }

  async getEarthquakesByCountry(countryName: string): Promise<Earthquake[]> {
    try {
      const command = new QueryCommand({
        TableName: this.dependencies.config.tables.earthquakes,
        KeyConditionExpression: "countryName = :countryName",
        ExpressionAttributeValues: {
          ":countryName": countryName,
        },
      });

      const response = await this.docClient.send(command);

      if (!response.Items) {
        return [];
      }

      return response.Items.map(
        (item) =>
          new Earthquake({
            eventId: item.eventId,
            name: item.name,
            magnitude: item.magnitude,
            date: item.date,
            type: item.type,
            tsunami: item.tsunami,
          }),
      );
    } catch (error) {
      this.dependencies.logger.error(
        "Error fetching earthquakes from DynamoDB:",
        { error: error instanceof Error ? error.message : "Unknown error" },
      );
      throw new Error("Failed to fetch earthquake data from database");
    }
  }

  async saveEarthquake(
    countryName: string,
    earthquake: Earthquake,
  ): Promise<void> {
    try {
      const command = new PutCommand({
        TableName: this.dependencies.config.tables.earthquakes,
        Item: {
          countryName,
          eventId: earthquake.eventId,
          name: earthquake.name,
          magnitude: earthquake.magnitude,
          date: earthquake.date,
          type: earthquake.type,
          tsunami: earthquake.tsunami,
        },
      });

      await this.docClient.send(command);
    } catch (error) {
      this.dependencies.logger.error("Error saving earthquake to DynamoDB", {
        error: error instanceof Error ? error.message : "Unknown error",
        countryName,
      });
      throw new Error("Failed to save earthquake data");
    }
  }

  async batchSaveEarthquakes(earthquakes: Earthquake[]): Promise<number> {
    const BATCH_SIZE = 25;
    const DELAY_MS = 1000;
    const MAX_RETRIES = 3;
    let successCount = 0;

    for (let i = 0; i < earthquakes.length; i += BATCH_SIZE) {
      const batch = earthquakes.slice(i, i + BATCH_SIZE);
      let unprocessedItems = batch;
      let retryCount = 0;

      while (unprocessedItems.length > 0 && retryCount <= MAX_RETRIES) {
        try {
          const putRequests = unprocessedItems.map((eq) => ({
            PutRequest: {
              Item: {
                eventId: eq.eventId,
                time: new Date(eq.date).getTime(),
                name: eq.name,
                magnitude: eq.magnitude,
                date: eq.date,
                type: eq.type,
                tsunami: eq.tsunami,
              },
            },
          }));

          const command = new BatchWriteCommand({
            RequestItems: {
              [this.dependencies.config.tables.earthquakes]: putRequests,
            },
          });

          const response = await this.docClient.send(command);

          const tableName = this.dependencies.config.tables.earthquakes;

          if (
            response.UnprocessedItems &&
            response.UnprocessedItems[tableName]
          ) {
            const unprocessedCount =
              response.UnprocessedItems[tableName].length;
            successCount += unprocessedItems.length - unprocessedCount;

            this.dependencies.logger.warn("Partial batch write success", {
              batchNumber: Math.floor(i / BATCH_SIZE) + 1,
              processed: unprocessedItems.length - unprocessedCount,
              unprocessed: unprocessedCount,
              retryCount,
            });

            unprocessedItems = response.UnprocessedItems[tableName].map(
              (item) => {
                const earthquakeItem = item.PutRequest?.Item as Record<
                  string,
                  unknown
                >;
                return new Earthquake({
                  eventId: earthquakeItem.eventId as string,
                  name: earthquakeItem.name as string,
                  magnitude: earthquakeItem.magnitude as number,
                  date: earthquakeItem.date as string,
                  type: earthquakeItem.type as string,
                  tsunami: earthquakeItem.tsunami as number,
                });
              },
            );

            retryCount++;
            if (unprocessedItems.length > 0) {
              await new Promise((resolve) =>
                setTimeout(resolve, DELAY_MS * Math.pow(2, retryCount)),
              );
            }
          } else {
            successCount += unprocessedItems.length;
            unprocessedItems = [];

            this.dependencies.logger.info("Batch write successful", {
              batchNumber: Math.floor(i / BATCH_SIZE) + 1,
              itemsWritten: batch.length,
              totalProcessed: successCount,
            });
          }
        } catch (error) {
          this.dependencies.logger.error("Error in batch write", {
            error: error instanceof Error ? error.message : "Unknown error",
            batchNumber: Math.floor(i / BATCH_SIZE) + 1,
            retryCount,
          });
          retryCount++;

          if (retryCount <= MAX_RETRIES) {
            await new Promise((resolve) =>
              setTimeout(resolve, DELAY_MS * Math.pow(2, retryCount)),
            );
          }
        }
      }

      if (i + BATCH_SIZE < earthquakes.length) {
        await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
      }
    }

    return successCount;
  }
}
