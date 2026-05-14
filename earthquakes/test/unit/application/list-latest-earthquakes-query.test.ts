import type { ApplicationConfig } from "@application/interfaces/config";
import { listLatestEarthquakesByCountry } from "@application/list-latest-earthquakes/list-latest-earthquakes-query";
import { Coordinates } from "@domain/entities/coordinates";
import { Earthquake } from "@domain/entities/earthquake";
import type { Dependencies } from "@infrastructure/dependencies";
import type { DbClient } from "../../../../shared/db/src/rds_client";

describe("listLatestEarthquakesByCountry", () => {
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

  const buildDependencies = (
    overrides: Partial<Dependencies> = {},
  ): Dependencies => {
    const coordinatesRepository = {
      getCoordinatesByCountryName: jest.fn() as jest.MockedFunction<
        Dependencies["coordinatesRepository"]["getCoordinatesByCountryName"]
      >,
    };
    const usgsService = {
      listEarthquakes: jest.fn() as jest.MockedFunction<
        Dependencies["usgsService"]["listEarthquakes"]
      >,
    };
    const earthquakeRepository = {
      getEarthquakesByCountry: jest.fn() as jest.MockedFunction<
        Dependencies["earthquakeRepository"]["getEarthquakesByCountry"]
      >,
      batchSaveEarthquakes: jest.fn() as jest.MockedFunction<
        Dependencies["earthquakeRepository"]["batchSaveEarthquakes"]
      >,
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
      rdsClient: {} as DbClient,
      coordinatesRepository,
      usgsService,
      earthquakeRepository,
      ...overrides,
    } as Dependencies;
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return earthquakes from USGS after resolving coordinates", async () => {
    const dependencies = buildDependencies();
    const coords = new Coordinates({ latitude: 40, longitude: -3 });
    const earthquakes = [
      new Earthquake({
        eventId: "evt-1",
        name: "Near Spain",
        magnitude: 4.2,
        date: "2024-01-15T10:00:00.000Z",
        type: "earthquake",
        tsunami: 0,
        place: "Spain",
        country: "Spain",
      }),
    ];
    jest
      .mocked(dependencies.coordinatesRepository.getCoordinatesByCountryName)
      .mockResolvedValue(coords);
    jest
      .mocked(dependencies.usgsService.listEarthquakes)
      .mockResolvedValue(earthquakes);

    const result = await listLatestEarthquakesByCountry(
      { countryName: "Spain" },
      dependencies,
    );

    expect(result.earthquakes).toEqual(earthquakes);
    expect(result.countryName).toBe("Spain");
    expect(
      dependencies.coordinatesRepository.getCoordinatesByCountryName,
    ).toHaveBeenCalledWith("Spain");
    expect(dependencies.usgsService.listEarthquakes).toHaveBeenCalledWith(
      expect.objectContaining({
        latitude: 40,
        longitude: -3,
      }),
    );
    expect(dependencies.logger.info).toHaveBeenCalled();
  });

  it("should throw validation error when country name is empty", async () => {
    const dependencies = buildDependencies();

    const run = listLatestEarthquakesByCountry(
      { countryName: "" },
      dependencies,
    );

    await expect(run).rejects.toMatchObject({
      errors: expect.arrayContaining([
        {
          path: "countryName",
          message: "Country name is required",
        },
      ]),
    });
    expect(
      dependencies.coordinatesRepository.getCoordinatesByCountryName,
    ).not.toHaveBeenCalled();
  });

  it("should throw validation error when country name contains digits", async () => {
    const dependencies = buildDependencies();

    const run = listLatestEarthquakesByCountry(
      { countryName: "Spain1" },
      dependencies,
    );

    await expect(run).rejects.toMatchObject({
      errors: [
        {
          path: "countryName",
          message:
            "Country name must contain only letters, spaces, and hyphens",
        },
      ],
    });
  });
});
