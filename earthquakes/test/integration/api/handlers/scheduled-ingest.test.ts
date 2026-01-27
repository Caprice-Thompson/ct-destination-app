import { handler } from "@api/handlers/scheduled-ingest";
import {
  type Dependencies,
  makeDependencies,
} from "@infrastructure/dependencies";
import { Earthquake } from "@domain/entities/earthquake";

jest.mock("@infrastructure/dependencies");

describe("scheduled-ingest integration", () => {
  let mockDependencies: Dependencies;
  const originalDateNow = Date.now;

  beforeEach(() => {
    Date.now = jest.fn(() => new Date("2024-02-15T10:00:00Z").getTime());

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
    Date.now = originalDateNow;
    jest.clearAllMocks();
  });

  it("should handle large batch of earthquakes successfully", async () => {
    const mockEarthquakes = Array.from({ length: 100 }, (_, i) => ({
      eventId: `eq${i}`,
      name: `Earthquake ${i}`,
      magnitude: 3.5 + Math.random(),
      date: "2024-02-10",
      type: "earthquake",
      tsunami: 0,
    })).map((props) => new Earthquake(props));

    (
      mockDependencies.earthquakeRepository.getEarthquakeData as jest.Mock
    ).mockResolvedValue(mockEarthquakes);

    (
      mockDependencies.historicalEarthquakeRepository
        .batchSaveEarthquakes as jest.Mock
    ).mockResolvedValue(100);

    const result = await handler();

    expect(result.statusCode).toBe(200);
    expect(result.body.totalFetched).toBe(100);
    expect(result.body.successfullyWritten).toBe(100);

    expect(
      mockDependencies.historicalEarthquakeRepository.batchSaveEarthquakes,
    ).toHaveBeenCalledWith(mockEarthquakes);
  });

  it("should handle partial success with some unprocessed items", async () => {
    const mockEarthquakes = Array.from({ length: 50 }, (_, i) => ({
      eventId: `eq${i}`,
      name: `Earthquake ${i}`,
      magnitude: 4.0,
      date: "2024-02-10",
      type: "earthquake",
      tsunami: 0,
    })).map((props) => new Earthquake(props));

    (
      mockDependencies.earthquakeRepository.getEarthquakeData as jest.Mock
    ).mockResolvedValue(mockEarthquakes);

    (
      mockDependencies.historicalEarthquakeRepository
        .batchSaveEarthquakes as jest.Mock
    ).mockResolvedValue(45);

    const result = await handler();

    expect(result.statusCode).toBe(200);
    expect(result.body.totalFetched).toBe(50);
    expect(result.body.successfullyWritten).toBe(45);

    expect(mockDependencies.logger.info).toHaveBeenCalledWith(
      "Scheduled ingestion completed",
      {
        totalFetched: 50,
        successfullyWritten: 45,
      },
    );
  });
});
