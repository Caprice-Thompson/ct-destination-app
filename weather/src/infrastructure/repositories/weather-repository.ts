import type { WeatherRepository } from "@application/interfaces";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { Temperature, WeatherData } from "@domain/entities/weather";
import type { Dependencies } from "@infrastructure/dependencies";

type WeatherDataDBItem = {
  countryCode?: string;
  countryName: string;
  month: string;
  wind: string;
  temperature: number | { min: number; max: number };
  humidity: string;
  pressure: string;
  visibility: string;
  windSpeed: string;
  date: string;
};

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

    return (response.Items as WeatherDataDBItem[]).map((item) => {
      const temperature =
        typeof item.temperature === "number"
          ? new Temperature(item.temperature, item.temperature)
          : new Temperature(item.temperature.min, item.temperature.max);

      return new WeatherData(
        item.countryCode ?? "",
        item.countryName,
        item.date,
        item.wind,
        temperature,
        item.humidity,
        item.pressure,
        item.visibility,
        item.windSpeed,
      );
    });
  };

  return {
    getWeatherDataByCountry,
  };
}
