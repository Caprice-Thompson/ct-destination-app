import { getEarthquakesSinceDateQuery } from "@application/get-earthquakes-since-last-date/get-earthquakes-since-query";
import { Earthquake } from "@domain/entities/earthquake";
import type { Dependencies } from "@infrastructure/dependencies";

describe("getEarthquakesSinceDateQuery", () => {
  const buildDependencies = () => {
    const earthquakeRepository = {
      getEarthquakesByCountry: jest.fn() as jest.MockedFunction<
        Dependencies["earthquakeRepository"]["getEarthquakesByCountry"]
      >,
      findSince: jest.fn() as jest.MockedFunction<
        Dependencies["earthquakeRepository"]["findSince"]
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
      earthquakeRepository,
      logger,
    } as Pick<Dependencies, "earthquakeRepository" | "logger">;
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return earthquakes found after the requested date", async () => {
    const dependencies = buildDependencies();
    const since = "2024-03-01T12:30:00.000Z";
    const earthquakes = [
      new Earthquake({
        eventId: "event-1",
        name: "Earthquake near Spain",
        magnitude: 4.2,
        date: "2024-03-02T10:00:00.000Z",
        type: "earthquake",
        tsunami: 0,
        place: "Spain",
        country: "Spain",
      }),
    ];
    jest
      .mocked(dependencies.earthquakeRepository.findSince)
      .mockResolvedValue(earthquakes);

    const result = await getEarthquakesSinceDateQuery({ since }, dependencies);

    expect(result).toEqual({ earthquakes });
    expect(dependencies.earthquakeRepository.findSince).toHaveBeenCalledWith(
      new Date(since),
    );
    expect(dependencies.logger.info).toHaveBeenCalledTimes(2);
  });

  it("should return an empty earthquake list when none are found", async () => {
    const dependencies = buildDependencies();
    jest
      .mocked(dependencies.earthquakeRepository.findSince)
      .mockResolvedValue([]);

    const result = await getEarthquakesSinceDateQuery(
      { since: "2024-03-01" },
      dependencies,
    );

    expect(result).toEqual({ earthquakes: [] });
  });

  it("should throw a validation error for an invalid date", async () => {
    const dependencies = buildDependencies();

    await expect(
      getEarthquakesSinceDateQuery({ since: "not-a-date" }, dependencies),
    ).rejects.toMatchObject({
      errors: expect.arrayContaining([
        {
          path: "since",
          message: "Invalid ISO 8601 timestamp",
        },
      ]),
    });
    expect(dependencies.earthquakeRepository.findSince).not.toHaveBeenCalled();
  });
});
