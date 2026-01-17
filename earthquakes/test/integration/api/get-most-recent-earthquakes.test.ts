import { handler } from "@api/get-most-recent-earthquakes";
import {
  type Dependencies,
  makeDependencies,
} from "@infrastructure/dependencies";
import { Earthquake } from "@domain/entities/earthquake";
import { Coordinates } from "@domain/entities/coordinates";
import { APIGatewayEvent } from "../../../src/types";

jest.mock("@infrastructure/dependencies");

describe("handler", () => {
  let mockDependencies: Dependencies;

  beforeEach(() => {
    mockDependencies = {
      config: {
        urls: {
          earthquakesApi: "https://api.example.com",
          restCountriesApiUrl: "https://api.example.com",
        },
      },
      logger: {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      },
      coordinatesRepository: {
        getCoordinatesByCountryName: jest.fn(),
      },
      earthquakeRepository: {
        getMostRecentEarthquakes: jest.fn(),
      },
      historicalEarthquakeRepository: {
        getEarthquakesByCountry: jest.fn(),
        saveEarthquake: jest.fn(),
      },
    } as unknown as Dependencies;

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
          name: "2 km NW of Santafé, Spain",
          magnitude: 4.3,
          date: "2021-01-28",
          type: "earthquake",
          tsunami: 0,
        }),
        new Earthquake({
          name: "2 km WNW of Atarfe, Spain",
          magnitude: 4.3,
          date: "2021-01-26",
          type: "earthquake",
          tsunami: 0,
        }),
      ];

      (
        mockDependencies.coordinatesRepository
          .getCoordinatesByCountryName as jest.Mock
      ).mockResolvedValue(mockCoordinates);
      (
        mockDependencies.earthquakeRepository
          .getMostRecentEarthquakes as jest.Mock
      ).mockResolvedValue(mockEarthquakes);

      const event: APIGatewayEvent = {
        queryStringParameters: {
          countryName: "Spain",
        },
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      expect(response.headers?.["Content-Type"]).toBe("application/json");

      const body = JSON.parse(response.body);
      expect(body.earthquakes).toHaveLength(2);
      expect(body.earthquakes[0].name).toBe("2 km NW of Santafé, Spain");
      expect(body.earthquakes[0].magnitude).toBe(4.3);
      expect(body.countryName).toBe("Spain");
    });

    it("should return empty array when no earthquakes found", async () => {
      const mockCoordinates = new Coordinates({ latitude: 40, longitude: -3 });
      (
        mockDependencies.coordinatesRepository
          .getCoordinatesByCountryName as jest.Mock
      ).mockResolvedValue(mockCoordinates);
      (
        mockDependencies.earthquakeRepository
          .getMostRecentEarthquakes as jest.Mock
      ).mockResolvedValue([]);

      const event: APIGatewayEvent = {
        queryStringParameters: {
          countryName: "Spain",
        },
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.earthquakes).toHaveLength(0);
    });
  });

  describe("Validation Errors", () => {
    it("should return 400 when query parameters are missing", async () => {
      const event: APIGatewayEvent = {
        queryStringParameters: null,
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      expect(response.headers?.["Content-Type"]).toBe("application/json");

      const body = JSON.parse(response.body);
      expect(body.error).toBe("Missing query parameters");
    });

    it("should return 400 for empty country name", async () => {
      const event: APIGatewayEvent = {
        queryStringParameters: {
          countryName: "",
        },
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBe("Validation error");
      expect(mockDependencies.logger.warn).toHaveBeenCalled();
    });
  });

  describe("Server Errors", () => {
    it("should return 500 when coordinates repository fails", async () => {
      (
        mockDependencies.coordinatesRepository
          .getCoordinatesByCountryName as jest.Mock
      ).mockRejectedValue(new Error("Country not found"));

      const event: APIGatewayEvent = {
        queryStringParameters: {
          countryName: "InvalidCountry",
        },
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(500);
      expect(response.headers?.["Content-Type"]).toBe("application/json");

      const body = JSON.parse(response.body);
      expect(body.error).toBe("Internal server error");
      expect(mockDependencies.logger.error).toHaveBeenCalled();
    });

    it("should return 500 when earthquake repository fails", async () => {
      const mockCoordinates = new Coordinates({ latitude: 40, longitude: -3 });
      (
        mockDependencies.coordinatesRepository
          .getCoordinatesByCountryName as jest.Mock
      ).mockResolvedValue(mockCoordinates);
      (
        mockDependencies.earthquakeRepository
          .getMostRecentEarthquakes as jest.Mock
      ).mockRejectedValue(new Error("API error"));

      const event: APIGatewayEvent = {
        queryStringParameters: {
          countryName: "Spain",
        },
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(500);
      const body = JSON.parse(response.body);
      expect(body.error).toBe("Internal server error");
    });

    it("should return 500 for unexpected errors", async () => {
      (
        mockDependencies.coordinatesRepository
          .getCoordinatesByCountryName as jest.Mock
      ).mockRejectedValue("Unexpected error");

      const event: APIGatewayEvent = {
        queryStringParameters: {
          countryName: "Spain",
        },
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(500);
    });
  });

  describe("CORS Headers", () => {
    it("should include CORS headers in successful response", async () => {
      const mockCoordinates = new Coordinates({ latitude: 40, longitude: -3 });
      (
        mockDependencies.coordinatesRepository
          .getCoordinatesByCountryName as jest.Mock
      ).mockResolvedValue(mockCoordinates);
      (
        mockDependencies.earthquakeRepository
          .getMostRecentEarthquakes as jest.Mock
      ).mockResolvedValue([]);

      const event: APIGatewayEvent = {
        queryStringParameters: {
          countryName: "Spain",
        },
      };

      const response = await handler(event);

      expect(response.headers?.["Access-Control-Allow-Origin"]).toBe("*");
    });
  });
});
