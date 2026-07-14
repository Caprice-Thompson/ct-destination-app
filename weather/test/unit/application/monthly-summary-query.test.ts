import type { ApplicationConfig } from "@application/interfaces/config";
import { getMonthlyWeatherSummary } from "@application/monthly-weather-summary/monthly-summary-query";
import { WeatherData } from "@domain/entities/weather";
import type { Dependencies } from "@infrastructure/dependencies";
import type { DbClient } from "../../../../shared/db/src/rds_client";

describe("getMonthlyWeatherSummary", () => {
  const baseConfig: ApplicationConfig = {
    aws: {
      region: "eu-west-2",
      accessKeyId: "test",
      secretAccessKey: "test",
    },
    service: { name: "weather-test" },
    tables: { weather: "weather-table" },
  };

  const buildDependencies = (
    overrides: Partial<Dependencies> = {},
  ): Dependencies => {
    const logger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };
    const weatherRepository = {
      getWeatherDataByCountry: jest.fn() as jest.MockedFunction<
        Dependencies["weatherRepository"]["getWeatherDataByCountry"]
      >,
    };

    return {
      config: baseConfig,
      logger,
      rdsClient: {} as DbClient,
      weatherRepository,
      ...overrides,
    } as Dependencies;
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 0 summary when no weather exists for country and month", async () => {
    const dependencies = buildDependencies();
    jest
      .mocked(dependencies.weatherRepository.getWeatherDataByCountry)
      .mockResolvedValue([]);

    const result = await getMonthlyWeatherSummary(
      { countryName: "Spain", month: "3" },
      dependencies,
    );

    expect(result).toEqual({
      countryName: "Spain",
      month: "3",
      totalWeatherRecords: 0,
      averageMinTemperature: 0,
      averageMaxTemperature: 0,
    });
  });

  it("should calculate average min and max temperatures for weather rows in target month", async () => {
    const dependencies = buildDependencies();
    const rows = [
      new WeatherData("ES", "Spain", "Madrid", "2024-03-01", 26, 10, 8),
      new WeatherData("ES", "Spain", "Madrid", "2024-03-02", 12, 24, 9),
    ];
    jest
      .mocked(dependencies.weatherRepository.getWeatherDataByCountry)
      .mockResolvedValue(rows);

    const result = await getMonthlyWeatherSummary(
      { countryName: "Spain", month: "3" },
      dependencies,
    );

    expect(
      dependencies.weatherRepository.getWeatherDataByCountry,
    ).toHaveBeenCalledWith("Spain", "3");
    expect(result).toEqual({
      countryName: "Spain",
      month: "3",
      totalWeatherRecords: 2,
      averageMinTemperature: 19,
      averageMaxTemperature: 17,
    });
  });

  it("should throw validation error when month is out of range", async () => {
    const dependencies = buildDependencies();

    const run = getMonthlyWeatherSummary(
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
