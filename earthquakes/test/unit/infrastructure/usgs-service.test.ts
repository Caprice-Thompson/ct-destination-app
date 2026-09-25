import type { ApplicationConfig } from "@application/interfaces/config";
import { Earthquake } from "@domain/entities/earthquake";
import type { Dependencies } from "@infrastructure/dependencies";
import { makeUsgsService } from "@infrastructure/services/usgs-service";

describe("makeUsgsService", () => {
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

  const buildDeps = (): Pick<Dependencies, "config" | "logger"> => ({
    config: baseConfig,
    logger: {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    },
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should map USGS features to Earthquake entities", async () => {
    const deps = buildDeps();
    const service = makeUsgsService(deps);
    const timeMs = Date.UTC(2024, 0, 10, 12, 0, 0);
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        type: "FeatureCollection",
        features: [
          {
            id: "us6000",
            properties: {
              mag: 4.5,
              place: "10 km W of Testville",
              time: timeMs,
              type: "earthquake",
              tsunami: 1,
            },
          },
        ],
        metadata: { count: 1 },
      }),
    });

    const result = await service.listEarthquakes({
      latitude: 1,
      longitude: 2,
      startTime: "2024-01-01",
      endTime: "2024-01-31",
      minMagnitude: 4,
      limit: 10,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(Earthquake);
    expect(result[0].eventId).toBe("us6000");
    expect(result[0].magnitude).toBe(4.5);
    expect(result[0].tsunami).toBe(1);
    expect(global.fetch).toHaveBeenCalled();
  });

  it("should throw when USGS responds with non-ok status", async () => {
    const deps = buildDeps();
    const service = makeUsgsService(deps);
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      statusText: "Bad Gateway",
    });

    const run = service.listEarthquakes({
      latitude: 0,
      longitude: 0,
      startTime: "2024-01-01",
      endTime: "2024-01-02",
    });

    await expect(run).rejects.toThrow(
      "Failed to fetch earthquake data from USGS: Bad Gateway",
    );
  });

  it("should throw when response is missing features array", async () => {
    const deps = buildDeps();
    const service = makeUsgsService(deps);
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ type: "FeatureCollection", metadata: { count: 0 } }),
    });

    const run = service.listEarthquakes({
      latitude: 0,
      longitude: 0,
      startTime: "2024-01-01",
      endTime: "2024-01-02",
    });

    await expect(run).rejects.toThrow("Invalid USGS API response format");
  });
});
