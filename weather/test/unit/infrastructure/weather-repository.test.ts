jest.mock("@aws-sdk/client-dynamodb", () => ({
  DynamoDBClient: jest.fn(() => ({})),
}));

jest.mock("@aws-sdk/lib-dynamodb", () => ({
  DynamoDBDocumentClient: {
    from: jest.fn(() => ({
      send: jest.fn(),
    })),
  },
  QueryCommand: jest.fn((input: unknown) => input),
}));

import type { ApplicationConfig } from "@application/interfaces/config";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { WeatherData } from "@domain/entities/weather";
import { makeWeatherRepository } from "@infrastructure/repositories/weather-repository";

describe("makeWeatherRepository", () => {
  const baseConfig: ApplicationConfig = {
    aws: {
      region: "eu-west-2",
      accessKeyId: "test",
      secretAccessKey: "test",
    },
    service: { name: "weather-test" },
    tables: { weather: "weather-table" },
  };

  const logger = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  const getSend = () => {
    const fromMock = DynamoDBDocumentClient.from as jest.Mock;
    return fromMock.mock.results[0].value.send as jest.Mock;
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should query weather by country and month", async () => {
    const repository = makeWeatherRepository({
      config: baseConfig,
      logger,
    });
    getSend().mockResolvedValue({ Items: [] });

    await repository.getWeatherDataByCountry("Spain", "3");

    expect(QueryCommand).toHaveBeenCalledWith({
      TableName: "weather-table",
      KeyConditionExpression: "#countryName = :countryName AND #month = :month",
      ExpressionAttributeNames: {
        "#countryName": "countryName",
        "#month": "month",
      },
      ExpressionAttributeValues: {
        ":countryName": "Spain",
        ":month": "3",
      },
    });
  });

  it("should return empty array when query returns no items", async () => {
    const repository = makeWeatherRepository({
      config: baseConfig,
      logger,
    });
    getSend().mockResolvedValue({});

    const result = await repository.getWeatherDataByCountry("Iceland", "1");

    expect(result).toEqual([]);
  });

  it("should map DynamoDB items to WeatherData instances", async () => {
    const repository = makeWeatherRepository({
      config: baseConfig,
      logger,
    });
    getSend().mockResolvedValue({
      Items: [
        {
          countryCode: "GR",
          countryName: "Greece",
          month: "6",
          date: "2024-06-01",
          capitalCity: "Athens",
          minTemperature: 18,
          maxTemperature: 28,
          averageTemperature: 23,
        },
      ],
    });

    const result = await repository.getWeatherDataByCountry("Greece", "6");

    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(WeatherData);
    expect(result[0].countryName).toBe("Greece");
    expect(result[0].minTemperature).toBe(18);
    expect(result[0].maxTemperature).toBe(28);
    expect(result[0].averageTemperature).toBe(23);
  });
});
