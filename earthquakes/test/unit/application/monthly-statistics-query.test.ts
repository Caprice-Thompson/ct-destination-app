import { getMonthlyEarthquakeStatisticsQuery } from "@application/get-monthly-stats/monthly-statistics-query";
import type { ApplicationConfig } from "@application/interfaces/config";
import { Earthquake } from "@domain/entities/earthquake";
import type { Dependencies } from "@infrastructure/dependencies";

describe("getMonthlyEarthquakeStatisticsQuery", () => {
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

  const buildDependencies = (
    overrides: Partial<Dependencies> = {},
  ): Dependencies => {
    const earthquakeRepository = {
      getEarthquakesByCountry: jest.fn() as jest.MockedFunction<
        Dependencies["earthquakeRepository"]["getEarthquakesByCountry"]
      >,
      batchSaveEarthquakes: jest.fn() as jest.MockedFunction<
        Dependencies["earthquakeRepository"]["batchSaveEarthquakes"]
      >,
    };
    const coordinatesRepository = {
      getCoordinatesByCountryName: jest.fn(),
    };
    const usgsService = {
      listEarthquakes: jest.fn(),
    };
    const logger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };
    return {
      config: baseConfig,
      logger,
      earthquakeRepository,
      coordinatesRepository,
      usgsService,
      ...overrides,
    } as Dependencies;
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 0 statistics when no earthquakes exist for country", async () => {
    const dependencies = buildDependencies();
    jest
      .mocked(dependencies.earthquakeRepository.getEarthquakesByCountry)
      .mockResolvedValue([]);

    const result = await getMonthlyEarthquakeStatisticsQuery(
      { countryName: "Iceland", month: "3" },
      dependencies,
    );

    expect(result).toEqual({
      totalEarthquakes: 0,
      monthlyEarthquakePercentage: 0,
      avgTsunamiCount: 0,
      avgMagnitude: 0,
    });
  });

  it("should compute monthly share magnitude and tsunami averages for earthquake rows in target month", async () => {
    const dependencies = buildDependencies();
    const rows = [
      new Earthquake({
        eventId: "a",
        name: "Jan",
        magnitude: 4,
        date: "2024-01-10T00:00:00.000Z",
        type: "earthquake",
        tsunami: 0,
        place: "X",
        country: "Spain",
      }),
      new Earthquake({
        eventId: "b",
        name: "Mar big",
        magnitude: 6,
        date: "2024-03-05T00:00:00.000Z",
        type: "earthquake",
        tsunami: 1,
        place: "Y",
        country: "Spain",
      }),
      new Earthquake({
        eventId: "c",
        name: "Mar small",
        magnitude: 4,
        date: "2024-03-20T00:00:00.000Z",
        type: "earthquake",
        tsunami: 0,
        place: "Z",
        country: "Spain",
      }),
      new Earthquake({
        eventId: "d",
        name: "Mar blast",
        magnitude: 2,
        date: "2024-03-21T00:00:00.000Z",
        type: "quarry blast",
        tsunami: 0,
        place: "Q",
        country: "Spain",
      }),
    ];
    jest
      .mocked(dependencies.earthquakeRepository.getEarthquakesByCountry)
      .mockResolvedValue(rows);

    const result = await getMonthlyEarthquakeStatisticsQuery(
      { countryName: "Spain", month: "3" },
      dependencies,
    );

    expect(result.totalEarthquakes).toBe(4);
    expect(result.monthlyEarthquakePercentage).toBe(50);
    expect(result.avgTsunamiCount).toBe(0.5);
    expect(result.avgMagnitude).toBe(5);
  });

  it("should throw validation error when month is out of range", async () => {
    const dependencies = buildDependencies();

    const run = getMonthlyEarthquakeStatisticsQuery(
      { countryName: "Spain", month: "13" },
      dependencies,
    );

    await expect(run).rejects.toMatchObject({
      errors: [
        {
          path: "month",
          message: "Month must be a number between 1 and 12",
        },
      ],
    });
  });
});
