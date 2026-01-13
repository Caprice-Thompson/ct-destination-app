import { HistoricalEarthquakeRepository } from "@application/interfaces/repositories";
import { Earthquake } from "@domain/entities/earthquake";

export class DynamoDBEarthquakeRepository implements HistoricalEarthquakeRepository {
  private readonly docClient: DynamoDBDocumentClient;
  private readonly tableName = "historical-earthquakes";

  constructor() {
    const client = new DynamoDBClient({
      region: process.env.AWS_REGION || "eu-west-1",
    });
    this.docClient = DynamoDBDocumentClient.from(client);
  }

  async getEarthquakesByCountry(countryName: string): Promise<Earthquake[]> {
    try {
      const command = new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: "countryName = :countryName",
        ExpressionAttributeValues: {
          ":countryName": countryName,
        },
      });

      const response = await this.docClient.send(command);

      if (!response.Items) {
        return [];
      }

      return response.Items.map(item => ({
        name: item.name,
        magnitude: item.magnitude,
        date: item.date,
        type: item.type,
        tsunami: item.tsunami,
      }));
    } catch (error) {
      logger.error("Error fetching earthquakes from DynamoDB:", error);
      throw new AppError(500, "Failed to fetch earthquake data from database");
    }
  }

  async saveEarthquake(countryName: string, earthquake: Earthquake & { id: string }): Promise<void> {
    try {
      const command = new PutCommand({
        TableName: this.tableName,
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
      logger.error("Error saving earthquake to DynamoDB:", error);
      throw new AppError(500, "Failed to save earthquake data");
    }
  }
}