import { CoordinatesRepository } from "@infrastructure/repositories/coordinates-repository";
import { Coordinates } from "@domain/entities/coordinates";
import type { Logger } from "@application/interfaces/logger";

describe("CoordinatesRepository", () => {
  let repository: CoordinatesRepository;
  let mockLogger: Logger;

  beforeEach(() => {
    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    repository = new CoordinatesRepository(
      "https://api.example.com",
      mockLogger,
    );

    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getCoordinatesByCountryName", () => {
    it("should fetch and return coordinates successfully", async () => {
      const mockResponse = [
        {
          name: {
            common: "Spain",
            official: "Kingdom of Spain",
          },
          latlng: [40, -3],
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await repository.getCoordinatesByCountryName("Spain");

      expect(result).toBeInstanceOf(Coordinates);
      expect(result.latitude).toBe(40);
      expect(result.longitude).toBe(-3);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        "Fetching coordinates from REST Countries API",
        expect.objectContaining({ countryName: "Spain" }),
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Coordinates fetched successfully",
        expect.objectContaining({
          countryName: "Spain",
          latitude: 40,
          longitude: -3,
        }),
      );
    });

    it("should encode country name in URL", async () => {
      const mockResponse = [
        {
          name: { common: "United Kingdom", official: "United Kingdom" },
          latlng: [54, -2],
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await repository.getCoordinatesByCountryName("United Kingdom");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("United%20Kingdom"),
      );
    });

    it("should throw error when API returns non-ok status", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });

      await expect(
        repository.getCoordinatesByCountryName("InvalidCountry"),
      ).rejects.toThrow(
        'Failed to fetch coordinates for country "InvalidCountry"',
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Error fetching coordinates from REST Countries API",
        expect.objectContaining({
          error: expect.stringContaining("404"),
          countryName: "InvalidCountry",
        }),
      );
    });

    it("should throw error when no coordinates available", async () => {
      const mockResponse = [
        {
          name: { common: "Test", official: "Test" },
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await expect(
        repository.getCoordinatesByCountryName("Test"),
      ).rejects.toThrow("No coordinates available for country: Test");
    });

    it("should throw error when fetch fails", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      await expect(
        repository.getCoordinatesByCountryName("Spain"),
      ).rejects.toThrow(
        'Failed to fetch coordinates for country "Spain": Network error',
      );

      expect(mockLogger.error).toHaveBeenCalled();
    });

    it("should handle decimal coordinates", async () => {
      const mockResponse = [
        {
          name: { common: "Japan", official: "Japan" },
          latlng: [36.204824, 138.252924],
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await repository.getCoordinatesByCountryName("Japan");

      expect(result.latitude).toBe(36.204824);
      expect(result.longitude).toBe(138.252924);
    });

    it("should handle negative coordinates", async () => {
      const mockResponse = [
        {
          name: { common: "Chile", official: "Chile" },
          latlng: [-30, -71],
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await repository.getCoordinatesByCountryName("Chile");

      expect(result.latitude).toBe(-30);
      expect(result.longitude).toBe(-71);
    });
  });
});
