import { getMostRecentEarthquakesByCountry } from "@application/get-most-recent-eq-query";
import { Earthquake } from "@domain/entities/earthquake";
import { Coordinates } from "@domain/entities/coordinates";
import { Dependencies } from "@infrastructure/dependencies";

describe("getMostRecentEarthquakesQuery", () => {
  let mockDependencies: Dependencies;

  beforeEach(() => {
    mockDependencies = {
      coordinatesRepository: {
        getCoordinatesByCountryName: jest.fn(),
      },
      earthquakeRepository: {
        getMostRecentEarthquakesByCountry: jest.fn(),
        getEarthquakeData: jest.fn(),
      },
      historicalEarthquakeRepository: {
        getEarthquakesByCountry: jest.fn(),
        saveEarthquake: jest.fn(),
        batchSaveEarthquakes: jest.fn(),
      },
      logger: {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      },
      config: {
        aws: {
          accessKeyId: "test-key",
          region: "eu-west-2",
          secretAccessKey: "test-secret",
          sessionToken: "test-token",
        },
        service: {
          name: "test-service",
        },
        tables: {
          earthquakes: "test-earthquakes-table",
        },
        urls: {
          earthquakesApi: "https://test-earthquakes-api.com",
          restCountriesApiUrl: "https://test-countries-api.com",
        },
      },
    } as unknown as Dependencies;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Successful Queries", () => {
    it("should fetch coordinates and earthquakes successfully", async () => {
      const mockCoordinates = new Coordinates({ latitude: 40, longitude: -3 });
      const mockEarthquakes = [
        new Earthquake({
          eventId: "us6000dcq4",
          name: "2 km NW of Santafé, Spain",
          magnitude: 4.3,
          date: "2021-01-28",
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
          .getMostRecentEarthquakesByCountry as jest.Mock
      ).mockResolvedValueOnce(mockEarthquakes);

      const query = {
        countryName: "Spain",
      };

      const result = await getMostRecentEarthquakesByCountry(
        query,
        mockDependencies,
      );

      expect(result.earthquakes).toHaveLength(1);
      expect(result.earthquakes[0].eventId).toBe("us6000dcq4");
      expect(result.earthquakes[0].name).toBe("2 km NW of Santafé, Spain");
      expect(result.countryName).toBe("Spain");

      expect(
        mockDependencies.coordinatesRepository.getCoordinatesByCountryName,
      ).toHaveBeenCalledWith("Spain");
      expect(
        mockDependencies.earthquakeRepository.getMostRecentEarthquakesByCountry,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          latitude: 40,
          longitude: -3,
          maxRadiusKm: 2,
          limit: 5,
        }),
      );
    });

    it("should use constants for earthquake query parameters", async () => {
      const mockCoordinates = new Coordinates({ latitude: 35, longitude: 139 });
      const mockEarthquakes: Earthquake[] = [];

      (
        mockDependencies.coordinatesRepository
          .getCoordinatesByCountryName as jest.Mock
      ).mockResolvedValue(mockCoordinates);
      (
        mockDependencies.earthquakeRepository
          .getMostRecentEarthquakesByCountry as jest.Mock
      ).mockResolvedValue(mockEarthquakes);

      const query = {
        countryName: "Japan",
      };

      await getMostRecentEarthquakesByCountry(query, mockDependencies);

      expect(
        mockDependencies.earthquakeRepository.getMostRecentEarthquakesByCountry,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          latitude: 35,
          longitude: 139,
          maxRadiusKm: 2,
          limit: 5,
        }),
      );
    });

    it("should handle empty earthquake results", async () => {
      const mockCoordinates = new Coordinates({ latitude: 40, longitude: -3 });

      (
        mockDependencies.coordinatesRepository
          .getCoordinatesByCountryName as jest.Mock
      ).mockResolvedValue(mockCoordinates);
      (
        mockDependencies.earthquakeRepository
          .getMostRecentEarthquakesByCountry as jest.Mock
      ).mockResolvedValue([]);

      const query = {
        countryName: "Spain",
      };

      const result = await getMostRecentEarthquakesByCountry(
        query,
        mockDependencies,
      );

      expect(result.earthquakes).toHaveLength(0);
      expect(result.countryName).toBe("Spain");
    });

    it("should log query start and completion", async () => {
      const mockCoordinates = new Coordinates({ latitude: 40, longitude: -3 });
      (
        mockDependencies.coordinatesRepository
          .getCoordinatesByCountryName as jest.Mock
      ).mockResolvedValue(mockCoordinates);
      (
        mockDependencies.earthquakeRepository
          .getMostRecentEarthquakesByCountry as jest.Mock
      ).mockResolvedValue([]);

      const query = {
        countryName: "Spain",
      };

      await getMostRecentEarthquakesByCountry(query, mockDependencies);

      expect(mockDependencies.logger.info).toHaveBeenCalledWith(
        "Starting get most recent earthquakes query",
        {
          query,
        },
      );
      expect(mockDependencies.logger.info).toHaveBeenCalledWith(
        "Get most recent earthquakes query completed successfully",
        expect.objectContaining({
          countryName: "Spain",
          earthquakesCount: 0,
        }),
      );
    });
  });

  describe("Validation Errors", () => {
    it("should throw error for empty country name", async () => {
      const query = {
        countryName: "",
      };

      await expect(
        getMostRecentEarthquakesByCountry(query, mockDependencies),
      ).rejects.toThrow("Validation error");
    });

    it("should throw error for invalid country name with special characters", async () => {
      const query = {
        countryName: "Spain123!@#",
      };

      await expect(
        getMostRecentEarthquakesByCountry(query, mockDependencies),
      ).rejects.toThrow("Validation error");
    });

    it("should throw error for invalid country name with numbers", async () => {
      const query = {
        countryName: "Spain99",
      };

      await expect(
        getMostRecentEarthquakesByCountry(query, mockDependencies),
      ).rejects.toThrow("Validation error");
    });
  });

  describe("Repository Errors", () => {
    it("should propagate coordinates repository errors", async () => {
      (
        mockDependencies.coordinatesRepository
          .getCoordinatesByCountryName as jest.Mock
      ).mockRejectedValue(new Error("Country not found"));

      const query = {
        countryName: "InvalidCountry",
      };

      await expect(
        getMostRecentEarthquakesByCountry(query, mockDependencies),
      ).rejects.toThrow("Country not found");
    });

    it("should propagate earthquake repository errors", async () => {
      const mockCoordinates = new Coordinates({ latitude: 40, longitude: -3 });
      (
        mockDependencies.coordinatesRepository
          .getCoordinatesByCountryName as jest.Mock
      ).mockResolvedValue(mockCoordinates);
      (
        mockDependencies.earthquakeRepository
          .getMostRecentEarthquakesByCountry as jest.Mock
      ).mockRejectedValue(new Error("API error"));

      const query = {
        countryName: "Spain",
      };

      await expect(
        getMostRecentEarthquakesByCountry(query, mockDependencies),
      ).rejects.toThrow("API error");
    });
  });
});
