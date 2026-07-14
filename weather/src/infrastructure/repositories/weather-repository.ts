import type { WeatherRepository } from "@application/interfaces";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { WeatherData } from "@domain/entities/weather";
import type { Dependencies } from "@infrastructure/dependencies";

export function makeWeatherRepository({
  config,
}: Pick<Dependencies, "config" | "logger">): WeatherRepository {
  const ddbClient = new DynamoDBClient({
    region: config.aws.region,
    credentials: {
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
      sessionToken: config.aws.sessionToken,
    },
    ...(process.env.AWS_ENDPOINT_URL && {
      endpoint: process.env.AWS_ENDPOINT_URL,
    }),
  });
  const docClient = DynamoDBDocumentClient.from(ddbClient);

  const getWeatherDataByCountry = async (
    countryName: string,
    month: string,
  ): Promise<WeatherData[]> => {
    const tableName = config.tables.weather;

    const command = new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: "#countryName = :countryName AND #month = :month",
      ExpressionAttributeNames: {
        "#countryName": "countryName",
        "#month": "month",
      },
      ExpressionAttributeValues: {
        ":countryName": countryName,
        ":month": month,
      },
    });

    const response = await docClient.send(command);

    if (!response.Items) {
      return [];
    }

    return (response.Items as WeatherData[]).map((item) => {
      return new WeatherData(
        item.countryCode,
        item.countryName,
        item.capitalCity,
        item.date,
        item.minTemperature,
        item.maxTemperature,
        item.averageTemperature,
      );
    });
  };

  return {
    getWeatherDataByCountry,
  };
}
