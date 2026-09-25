import type { ApplicationConfig } from "@application/interfaces/config";
import { Coordinates } from "@domain/entities/coordinates";
import type { Dependencies } from "@infrastructure/dependencies";
import { makeCoordinatesRepository } from "@infrastructure/services/coordinates-service";

describe("makeCoordinatesRepository", () => {
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
      restCountriesAuthorization: "test",
    },
  };

  const buildDependencies = (): Pick<Dependencies, "config" | "logger"> => ({
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

  describe("getCoordinatesByCountryName", () => {
    it("should fetch and return coordinates successfully", async () => {
      const deps = buildDependencies();
      const repository = makeCoordinatesRepository(deps);
      const mockResponse = {
        data: {
          objects: [
            {
              coordinates: {
                lat: 40,
                lng: -3,
              },
            },
          ],
        },
      };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await repository.getCoordinatesByCountryName("Spain");

      expect(result).toBeInstanceOf(Coordinates);
      expect(result.latitude).toBe(40);
      expect(result.longitude).toBe(-3);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://example.invalid/v3.1?names.common=Spain",
        expect.any(Object),
      );
      expect(deps.logger.info).toHaveBeenCalledWith(
        "Coordinates fetched successfully",
        expect.objectContaining({
          countryName: "Spain",
          latitude: 40,
          longitude: -3,
        }),
      );
    });

    it("should encode country names with spaces in the request URL", async () => {
      const deps = buildDependencies();
      const repository = makeCoordinatesRepository(deps);
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            objects: [
              {
                coordinates: {
                  lat: 54,
                  lng: -2,
                },
              },
            ],
          },
        }),
      });

      await repository.getCoordinatesByCountryName("United Kingdom");

      expect(global.fetch).toHaveBeenCalledWith(
        "https://example.invalid/v3.1?names.common=United%20Kingdom",
        expect.any(Object),
      );
    });

    it("should throw when API responds with non-ok status", async () => {
      const deps = buildDependencies();
      const repository = makeCoordinatesRepository(deps);
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });

      await expect(
        repository.getCoordinatesByCountryName("Nowhere"),
      ).rejects.toThrow(
        "Failed to fetch coordinates from REST Countries API: 404 Not Found",
      );
      expect(deps.logger.error).toHaveBeenCalledWith(
        "Error fetching coordinates from REST Countries API",
        expect.objectContaining({
          countryName: "Nowhere",
        }),
      );
    });

    it("should throw when response has no latlng", async () => {
      const deps = buildDependencies();
      const repository = makeCoordinatesRepository(deps);
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            objects: [
              {
                coordinates: null,
              },
            ],
          },
        }),
      });

      await expect(
        repository.getCoordinatesByCountryName("Test"),
      ).rejects.toThrow("No coordinates available for country: Test");
    });
  });
});
