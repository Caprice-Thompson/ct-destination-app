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
  BatchWriteCommand: jest.fn((input: unknown) => input),
}));

import type { ApplicationConfig } from "@application/interfaces/config";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { Earthquake } from "@domain/entities/earthquake";
import { makeEarthquakeRepository } from "@infrastructure/repositories/eq-repo";

describe("makeEarthquakeRepository", () => {
  const baseConfig: ApplicationConfig = {
    aws: {
      region: "eu-west-2",
      accessKeyId: "test",
      secretAccessKey: "test",
    },
    service: { name: "earthquakes-test" },
    tables: { earthquakes: "eq-table" },
    urls: {
      usgsApi: "https://example.invalid/fdsnws/event/1/query",
      restCountriesApiUrl: "https://example.invalid/v3.1",
      restCountriesAuthorization: "fake-auth",
    },
  };

  const getSend = () => {
    const fromMock = DynamoDBDocumentClient.from as jest.Mock;
    return fromMock.mock.results[0].value.send as jest.Mock;
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return empty array when query returns no items", async () => {
    const logger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };
    const repository = makeEarthquakeRepository({
      config: baseConfig,
      logger,
    });
    getSend().mockResolvedValue({});

    const result = await repository.getEarthquakesByCountry("Iceland");

    expect(result).toEqual([]);
  });

  it("should map DynamoDB items to Earthquake instances", async () => {
    const logger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };
    const repository = makeEarthquakeRepository({
      config: baseConfig,
      logger,
    });
    getSend().mockResolvedValue({
      Items: [
        {
          eventId: "e1",
          name: "Quake",
          magnitude: 5.2,
          date: "2024-06-01",
          type: "earthquake",
          tsunami: 0,
          place: "10 km E of Athens, Greece",
          country: "Greece",
        },
      ],
    });

    const result = await repository.getEarthquakesByCountry("Greece");

    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(Earthquake);
    expect(result[0].eventId).toBe("e1");
    expect(result[0].country).toBe("Greece");
  });

  it("should return processed count from batchSaveEarthquakes when batch completes", async () => {
    const logger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };
    const repository = makeEarthquakeRepository({
      config: baseConfig,
      logger,
    });
    getSend().mockResolvedValue({});

    const count = await repository.batchSaveEarthquakes([
      new Earthquake({
        eventId: "b1",
        name: "A",
        magnitude: 3,
        date: "2024-01-01T00:00:00.000Z",
        type: "earthquake",
        tsunami: 0,
        place: "Near Paris, France",
        country: "",
      }),
    ]);

    expect(count).toBe(1);
    expect(getSend()).toHaveBeenCalled();
  });
});
