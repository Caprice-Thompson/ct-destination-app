import { HistoricalEarthquakeRepository } from "@application/interfaces/repositories";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
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
    earthquake: Earthquake & { id: string },
  ): Promise<void> {
    try {
      const command = new PutCommand({
        TableName: this.dependencies.config.tables.earthquakes,
        Item: {
          countryName,
          id: earthquake.id,
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
}
