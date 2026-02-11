import type { HistoricalEarthquakeRepository } from "@application/interfaces/repositories";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { Earthquake } from "@domain/entities/earthquake";
import { findCountryInString } from "@domain/utils/country-extractor";
import type { Dependencies } from "@infrastructure/dependencies";

export class DynamoDBEarthquakeRepository
  implements HistoricalEarthquakeRepository
{
  private readonly docClient: DynamoDBDocumentClient;
  private readonly dependencies: Pick<Dependencies, "config" | "logger">;

  constructor(dependencies: Pick<Dependencies, "config" | "logger">) {
    this.dependencies = dependencies;
    const clientConfig: Record<string, unknown> = {
      region: dependencies.config.aws.region,
    };

    const endpointUrl = process.env.AWS_ENDPOINT_URL;
    if (endpointUrl) {
      clientConfig.endpoint = endpointUrl;
      clientConfig.credentials = {
        accessKeyId: dependencies.config.aws.accessKeyId || "test",
        secretAccessKey: dependencies.config.aws.secretAccessKey || "test",
      };
    }

    this.docClient = DynamoDBDocumentClient.from(
      new DynamoDBClient(clientConfig),
    );
  }

  async getEarthquakesByCountry(countryName: string): Promise<Earthquake[]> {
    try {
      const command = new QueryCommand({
        TableName: this.dependencies.config.tables.earthquakes,
        IndexName: "country-type-index", // Use the GSI
        KeyConditionExpression: "country = :country",
        ExpressionAttributeValues: {
          ":country": countryName,
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
            place: item.place,
            country: item.country,
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
          const putRequests = unprocessedItems.map((eq) => {
            // Use the country from the earthquake object (already fetched from coordinates)
            // Fall back to extracting from place string, and if still empty, use "Unknown"
            const country =
              eq.country || findCountryInString(eq.place) || "Unknown";

            // Ensure all values are properly typed and not null/undefined
            const item: Record<string, unknown> = {
              eventId: String(eq.eventId),
              time: Number(new Date(eq.date).getTime()),
              name: String(eq.name || "Unknown"),
              magnitude: Number(eq.magnitude) || 0,
              date: String(eq.date),
              type: String(eq.type || "earthquake"),
              tsunami: Number(eq.tsunami) || 0,
              place: String(eq.place || "Unknown"),
              country: String(country),
            };

            return {
              PutRequest: {
                Item: item,
              },
            };
          });

          const command = new BatchWriteCommand({
            RequestItems: {
              [this.dependencies.config.tables.earthquakes]: putRequests,
            },
          });

          const response = await this.docClient.send(command);

          const tableName = this.dependencies.config.tables.earthquakes;

          if (response.UnprocessedItems?.[tableName]) {
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
                  place: earthquakeItem.place as string,
                  country: earthquakeItem.country as string,
                });
              },
            );

            retryCount++;
            if (unprocessedItems.length > 0) {
              await new Promise((resolve) =>
                setTimeout(resolve, DELAY_MS * 2 ** retryCount),
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
              setTimeout(resolve, DELAY_MS * 2 ** retryCount),
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

  async checkExistingEarthquakes(
    eventIds: string[],
    times: string[],
  ): Promise<Set<string>> {
    const existingIds = new Set<string>();
    const BATCH_SIZE = 100;

    for (let i = 0; i < eventIds.length; i += BATCH_SIZE) {
      const batch = eventIds.slice(i, i + BATCH_SIZE);
      const batchTimes = times.slice(i, i + BATCH_SIZE);
      try {
        // Use Query with both partition key (eventId) and sort key (time)
        const checkPromises = batch.map(async (eventId, index) => {
          try {
            const command = new QueryCommand({
              TableName: this.dependencies.config.tables.earthquakes,
              KeyConditionExpression: "eventId = :eventId AND #time = :time",
              ExpressionAttributeNames: {
                "#time": "time",
              },
              ExpressionAttributeValues: {
                ":eventId": eventId,
                ":time": batchTimes[index],
              },
              Limit: 1,
              Select: "COUNT",
            });

            const response = await this.docClient.send(command);
            if (response.Count && response.Count > 0) {
              return eventId;
            }
            return null;
          } catch (error) {
            this.dependencies.logger.warn(
              "Error checking earthquake existence",
              {
                eventId,
                time: batchTimes[index],
                error: error instanceof Error ? error.message : "Unknown error",
              },
            );
            return null;
          }
        });

        const results = await Promise.all(checkPromises);
        for (const id of results) {
          if (id) existingIds.add(id);
        }
      } catch (error) {
        this.dependencies.logger.error("Error in batch check", {
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return existingIds;
  }
}
