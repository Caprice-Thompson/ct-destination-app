jest.mock("@shared/utils/src/tracing", () => ({
  withTraceLogging: <I, O>(
    handler: (event?: I, context?: unknown) => Promise<O>,
  ) => handler,
}));

jest.mock("@infrastructure/dependencies", () => ({
  makeDependencies: jest.fn(),
}));

import { handler } from "@api/get-most-recent-earthquakes";
import type { APIGatewayProxyEvent } from "@api/wrappers";
import type { ApplicationConfig } from "@application/interfaces/config";
import { Coordinates } from "@domain/entities/coordinates";
import { Earthquake } from "@domain/entities/earthquake";
import {
  type Dependencies,
  makeDependencies,
} from "@infrastructure/dependencies";
import type { DbClient } from "../../../../shared/db/src/rds_client";

describe("get-most-recent-earthquakes handler", () => {
  let mockDependencies: Dependencies;

  const baseConfig: ApplicationConfig = {
    aws: {
      region: "eu-west-2",
      accessKeyId: "test",
      secretAccessKey: "test",
    },
    database: { connectionString: "postgres://localhost/test" },
    service: { name: "earthquakes-test" },
    tables: { earthquakes: "eq-table" },
    urls: {
      usgsApi: "https://example.invalid/fdsnws/event/1/query",
      restCountriesApiUrl: "https://example.invalid/v3.1",
    },
  };

  beforeEach(() => {
    mockDependencies = {
      config: baseConfig,
      logger: {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      },
      rdsClient: {
        closeConnection: jest.fn().mockResolvedValue(undefined),
      } as unknown as DbClient,
      coordinatesRepository: {
        getCoordinatesByCountryName: jest.fn(),
      },
      earthquakeRepository: {
        getEarthquakesByCountry: jest.fn(),
        batchSaveEarthquakes: jest.fn(),
      },
      usgsService: {
        listEarthquakes: jest.fn(),
      },
    } as Dependencies;

    (makeDependencies as jest.Mock).mockResolvedValue(mockDependencies);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe("Successful Requests", () => {
    it("should return 200 with earthquake data", async () => {
      const mockCoordinates = new Coordinates({ latitude: 40, longitude: -3 });
      const mockEarthquakes = [
        new Earthquake({
          eventId: "evt-mock-1",
          name: "Mock location A",
          magnitude: 4.3,
          date: "2021-01-28",
          type: "earthquake",
          tsunami: 0,
          place: "Mock place A",
          country: "Spain",
        }),
        new Earthquake({
          eventId: "evt-mock-2",
          name: "Mock location B",
          magnitude: 4.3,
          date: "2021-01-26",
          type: "earthquake",
          tsunami: 0,
          place: "Mock place B",
          country: "Spain",
        }),
      ];

      jest
        .mocked(
          mockDependencies.coordinatesRepository.getCoordinatesByCountryName,
        )
        .mockResolvedValue(mockCoordinates);
      jest
        .mocked(mockDependencies.usgsService.listEarthquakes)
        .mockResolvedValue(mockEarthquakes);

      const event: APIGatewayProxyEvent = {
        queryStringParameters: {
          countryName: "Spain",
        },
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      expect(response.headers?.["Content-Type"]).toBe("application/json");

      const body = JSON.parse(response.body) as {
        earthquakes: Earthquake[];
        countryName: string;
      };
      expect(body.earthquakes).toHaveLength(2);
      expect(body.earthquakes[0].eventId).toBe("evt-mock-1");
      expect(body.earthquakes[1].eventId).toBe("evt-mock-2");
      expect(body.earthquakes[0].name).toBe("Mock location A");
      expect(body.earthquakes[0].magnitude).toBe(4.3);
      expect(body.countryName).toBe("Spain");
      expect(mockDependencies.rdsClient.closeConnection).toHaveBeenCalled();
    });

    it("should return empty earthquakes array when USGS returns none", async () => {
      const mockCoordinates = new Coordinates({ latitude: 40, longitude: -3 });
      jest
        .mocked(
          mockDependencies.coordinatesRepository.getCoordinatesByCountryName,
        )
        .mockResolvedValue(mockCoordinates);
      jest
        .mocked(mockDependencies.usgsService.listEarthquakes)
        .mockResolvedValue([]);

      const event: APIGatewayProxyEvent = {
        queryStringParameters: {
          countryName: "Spain",
        },
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body) as {
        earthquakes: Earthquake[];
        countryName: string;
      };
      expect(body.earthquakes).toHaveLength(0);
      expect(body.countryName).toBe("Spain");
    });
  });

  describe("Validation Errors", () => {
    it("should return 400 when query parameters are missing", async () => {
      const event = {
        queryStringParameters: undefined,
      } as APIGatewayProxyEvent;

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      expect(response.headers?.["Content-Type"]).toBe("application/json");

      const body = JSON.parse(response.body) as {
        error: string;
        details: { path: string; message: string }[];
      };
      expect(body.error).toBe("Validation failed");
      expect(body.details.some((d) => d.path === "countryName")).toBe(true);
    });

    it("should return 400 for empty country name", async () => {
      const event: APIGatewayProxyEvent = {
        queryStringParameters: {
          countryName: "",
        },
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body) as {
        error: string;
        details: unknown[];
      };
      expect(body.error).toBe("Validation failed");
      expect(mockDependencies.logger.warn).toHaveBeenCalled();
    });
  });

  describe("Server Errors", () => {
    it("should return 500 when coordinates repository fails", async () => {
      jest
        .mocked(
          mockDependencies.coordinatesRepository.getCoordinatesByCountryName,
        )
        .mockRejectedValue(new Error("Country not found"));

      const event: APIGatewayProxyEvent = {
        queryStringParameters: {
          countryName: "InvalidCountry",
        },
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(500);
      expect(response.headers?.["Content-Type"]).toBe("application/json");

      const body = JSON.parse(response.body) as { error: string };
      expect(body.error).toBe("Internal server error");
      expect(mockDependencies.logger.error).toHaveBeenCalled();
      expect(mockDependencies.rdsClient.closeConnection).toHaveBeenCalled();
    });

    it("should return 500 when USGS service fails", async () => {
      const mockCoordinates = new Coordinates({ latitude: 40, longitude: -3 });
      jest
        .mocked(
          mockDependencies.coordinatesRepository.getCoordinatesByCountryName,
        )
        .mockResolvedValue(mockCoordinates);
      jest
        .mocked(mockDependencies.usgsService.listEarthquakes)
        .mockRejectedValue(new Error("API error"));

      const event: APIGatewayProxyEvent = {
        queryStringParameters: {
          countryName: "Spain",
        },
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(500);
      const body = JSON.parse(response.body) as { error: string };
      expect(body.error).toBe("Internal server error");
    });

    it("should return 500 for unexpected errors", async () => {
      jest
        .mocked(
          mockDependencies.coordinatesRepository.getCoordinatesByCountryName,
        )
        .mockRejectedValue("Unexpected error");

      const event: APIGatewayProxyEvent = {
        queryStringParameters: {
          countryName: "Spain",
        },
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(500);
    });
  });
});
