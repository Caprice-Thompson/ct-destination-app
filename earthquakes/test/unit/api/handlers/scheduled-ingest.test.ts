import { handler } from "@api/handlers/scheduled-ingest";
import { Earthquake } from "@domain/entities/earthquake";
import {
  type Dependencies,
  makeDependencies,
} from "@infrastructure/dependencies";

jest.mock("@infrastructure/dependencies");

describe("scheduled-ingest handler", () => {
  let mockDependencies: Dependencies;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-02-15T10:00:00Z"));

    mockDependencies = {
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
      coordinatesRepository: {
        getCoordinatesByCountryName: jest.fn(),
      },
    } as unknown as Dependencies;

    (makeDependencies as jest.Mock).mockResolvedValue(mockDependencies);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("should successfully ingest earthquakes and return 200", async () => {
    const mockEarthquakes = [
      new Earthquake({
        eventId: "us6000dcq4",
        name: "2 km NW of Santafé, Spain",
        magnitude: 4.3,
        date: "2024-02-10",
        type: "earthquake",
        tsunami: 0,
        place: "2 km NW of Santafé, Spain",
        country: "Spain",
      }),
      new Earthquake({
        eventId: "us7000d3it",
        name: "2 km WNW of Atarfe, Spain",
        magnitude: 3.8,
        date: "2024-02-12",
        type: "earthquake",
        tsunami: 0,
        place: "2 km WNW of Atarfe, Spain",
        country: "Spain",
      }),
    ];

    (
      mockDependencies.earthquakeRepository.getEarthquakeIngestData as jest.Mock
    ).mockResolvedValue(mockEarthquakes);

    (
      mockDependencies.historicalEarthquakeRepository
        .batchSaveEarthquakes as jest.Mock
    ).mockResolvedValue(2);

    const result = await handler();

    expect(result.statusCode).toBe(200);
    expect(result.body.message).toBe("Ingestion completed successfully");
    expect(result.body.totalFetched).toBe(2);
    expect(result.body.successfullyWritten).toBe(2);

    expect(
      mockDependencies.earthquakeRepository.getEarthquakeIngestData,
    ).toHaveBeenCalledWith({
      startTime: "2024-01-15",
      endTime: "2024-02-15",
    });

    expect(
      mockDependencies.historicalEarthquakeRepository.batchSaveEarthquakes,
    ).toHaveBeenCalledWith(mockEarthquakes);

    expect(mockDependencies.logger.info).toHaveBeenCalledWith(
      "Starting scheduled earthquake ingestion",
    );
    expect(mockDependencies.logger.info).toHaveBeenCalledWith(
      "Scheduled ingestion completed",
      {
        totalFetched: 2,
        successfullyWritten: 2,
      },
    );
  });

  it("should return 200 with message when no earthquakes to ingest", async () => {
    (
      mockDependencies.earthquakeRepository.getEarthquakeIngestData as jest.Mock
    ).mockResolvedValue([]);

    const result = await handler();

    expect(result.statusCode).toBe(200);
    expect(result.body.message).toBe("No earthquakes to ingest");

    expect(
      mockDependencies.historicalEarthquakeRepository.batchSaveEarthquakes,
    ).not.toHaveBeenCalled();

    expect(mockDependencies.logger.info).toHaveBeenCalledWith(
      "No earthquakes to ingest",
    );
  });

  it("should handle error from earthquake API and return 500", async () => {
    const error = new Error("API connection failed");

    (
      mockDependencies.earthquakeRepository.getEarthquakeIngestData as jest.Mock
    ).mockRejectedValue(error);

    const result = await handler();

    expect(result.statusCode).toBe(500);
    expect(result.body.message).toBe("Ingestion failed");
    expect(result.body.error).toBe("API connection failed");

    expect(mockDependencies.logger.error).toHaveBeenCalledWith(
      "Scheduled ingestion failed",
      {
        error: "API connection failed",
        stack: expect.any(String),
      },
    );
  });

  it("should handle error from DynamoDB batch write and return 500", async () => {
    const mockEarthquakes = [
      new Earthquake({
        eventId: "us6000dcq4",
        name: "Test earthquake",
        magnitude: 4.3,
        date: "2024-02-10",
        type: "earthquake",
        tsunami: 0,
        place: "2 km NW of Santafé, Spain",
        country: "Spain",
      }),
    ];

    (
      mockDependencies.earthquakeRepository.getEarthquakeIngestData as jest.Mock
    ).mockResolvedValue(mockEarthquakes);

    const dbError = new Error("DynamoDB write failed");
    (
      mockDependencies.historicalEarthquakeRepository
        .batchSaveEarthquakes as jest.Mock
    ).mockRejectedValue(dbError);

    const result = await handler();

    expect(result.statusCode).toBe(500);
    expect(result.body.message).toBe("Ingestion failed");
    expect(result.body.error).toBe("DynamoDB write failed");

    expect(mockDependencies.logger.error).toHaveBeenCalledWith(
      "Scheduled ingestion failed",
      {
        error: "DynamoDB write failed",
        stack: expect.any(String),
      },
    );
  });

  it("should handle non-Error exceptions gracefully", async () => {
    (
      mockDependencies.earthquakeRepository.getEarthquakeIngestData as jest.Mock
    ).mockRejectedValue("Unknown error string");

    const result = await handler();

    expect(result.statusCode).toBe(500);
    expect(result.body.message).toBe("Ingestion failed");
    expect(result.body.error).toBe("Unknown error");

    expect(mockDependencies.logger.error).toHaveBeenCalledWith(
      "Scheduled ingestion failed",
      {
        error: "Unknown error",
        stack: undefined,
      },
    );
  });
});
