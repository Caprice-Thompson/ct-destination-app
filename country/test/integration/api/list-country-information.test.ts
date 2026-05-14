import type { CityPopulation } from "@domain/entities/city-population";
import {
  Coordinates,
  CountryFacts,
  Currency,
  MapDetails,
} from "@domain/entities/country-facts";
import { NationalDish } from "@domain/entities/national-dish";
import { listCountryInformationHandler } from "@infrastructure/../api/list-country-information";
import type { Dependencies } from "@infrastructure/dependencies";
import { mockDeep } from "jest-mock-extended";

describe("listCountryInformationHandler", () => {
  let dependencies: Dependencies;

  beforeEach(() => {
    dependencies = mockDeep<Dependencies>();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Successful Execution", () => {
    it("should return complete country information when all data is available", async () => {
      const mockCountry = new CountryFacts({
        countryCode: "ES",
        countryName: "Spain",
        capitalCityName: "Madrid",
        flagUrl: "https://flagcdn.com/es.svg",
        languages: ["Spanish", "Catalan"],
        currency: new Currency("Euro", "€"),
        coordinates: new Coordinates(40.0, -4.0),
        maps: new MapDetails("https://google.com", "https://osm.org"),
      });

      const mockPopulation = [
        { cityName: "Madrid", population: 3223334 },
        { cityName: "Barcelona", population: 1620343 },
      ];

      const mockDish = new NationalDish(
        "ES",
        "Spain",
        "Paella",
        null,
        "A traditional Spanish rice dish",
      );

      jest
        .mocked(dependencies.countryApiRepository.getCountryFacts)
        .mockResolvedValue(mockCountry);
      jest
        .mocked(dependencies.countryDataRepository.getNationalDish)
        .mockResolvedValue(mockDish);
      jest
        .mocked(dependencies.populationApiRepository.getTopCityPopulations)
        .mockResolvedValue(mockPopulation as CityPopulation[]);

      const event = { queryStringParameters: { countryName: "Spain" } };

      const response = await listCountryInformationHandler(dependencies, event);

      expect(response.countryDetails).toEqual(mockCountry.toJSON());
      expect(response.cityPopulation).toEqual(mockPopulation);
      expect(response.nationalDish).toEqual(mockDish);
    });

    it("should return undefined for optional data when not found", async () => {
      const mockCountry = new CountryFacts({
        countryCode: "XX",
        countryName: "Test Country",
        capitalCityName: "Test City",
        flagUrl: "https://flag.url",
        languages: ["Test"],
        currency: new Currency("Test", "T"),
        coordinates: new Coordinates(0, 0),
        maps: new MapDetails("", ""),
      });

      jest
        .mocked(dependencies.countryApiRepository.getCountryFacts)
        .mockResolvedValue(mockCountry);
      jest
        .mocked(dependencies.countryDataRepository.getNationalDish)
        .mockResolvedValue(null);
      jest
        .mocked(dependencies.populationApiRepository.getTopCityPopulations)
        .mockResolvedValue([]);

      const event = { queryStringParameters: { countryName: "Test Country" } };
      const response = await listCountryInformationHandler(dependencies, event);

      expect(response.countryDetails.countryCode).toBe("XX");
      expect(response.cityPopulation).toBeUndefined();
      expect(response.nationalDish).toBeUndefined();
    });
  });

  describe("Validation Errors", () => {
    it("should return error response for missing country name", async () => {
      const event = { queryStringParameters: {} };

      await expect(
        listCountryInformationHandler(dependencies, event),
      ).rejects.toThrow();
    });
  });

  describe("Error Handling", () => {
    it("should return error for country not found", async () => {
      jest
        .mocked(dependencies.countryApiRepository.getCountryFacts)
        .mockResolvedValue(null);

      const event = {
        queryStringParameters: { countryName: "NonExistentCountry" },
      };

      await expect(
        listCountryInformationHandler(dependencies, event),
      ).rejects.toThrow("Country Facts not found");
    });

    it("should propagate underlying API repository errors", async () => {
      jest
        .mocked(dependencies.countryApiRepository.getCountryFacts)
        .mockRejectedValue(new Error("API connection failed"));

      const event = { queryStringParameters: { countryName: "Spain" } };

      await expect(
        listCountryInformationHandler(dependencies, event),
      ).rejects.toThrow("API connection failed");
    });

    it("should propagate database errors from city population", async () => {
      const mockCountry = new CountryFacts({
        countryCode: "ES",
        countryName: "Spain",
        capitalCityName: "Madrid",
        flagUrl: "https://flag.url",
        languages: ["Spanish"],
        currency: new Currency("Euro", "€"),
        coordinates: new Coordinates(40.0, -4.0),
        maps: new MapDetails("", ""),
      });

      jest
        .mocked(dependencies.countryApiRepository.getCountryFacts)
        .mockResolvedValue(mockCountry);
      jest
        .mocked(dependencies.populationApiRepository.getTopCityPopulations)
        .mockRejectedValue(new Error("Database error"));
      jest
        .mocked(dependencies.countryDataRepository.getNationalDish)
        .mockResolvedValue(null);

      const event = { queryStringParameters: { countryName: "Spain" } };

      await expect(
        listCountryInformationHandler(dependencies, event),
      ).rejects.toThrow("Database error");
    });

    it("should propagate database errors from national dish", async () => {
      const mockCountry = new CountryFacts({
        countryCode: "ES",
        countryName: "Spain",
        capitalCityName: "Madrid",
        flagUrl: "https://flag.url",
        languages: ["Spanish"],
        currency: new Currency("Euro", "€"),
        coordinates: new Coordinates(40.0, -4.0),
        maps: new MapDetails("", ""),
      });

      jest
        .mocked(dependencies.countryApiRepository.getCountryFacts)
        .mockResolvedValue(mockCountry);
      jest
        .mocked(dependencies.countryDataRepository.getNationalDish)
        .mockRejectedValue(new Error("Database error"));

      const event = { queryStringParameters: { countryName: "Spain" } };

      await expect(
        listCountryInformationHandler(dependencies, event),
      ).rejects.toThrow("Database error");
    });
  });

  describe("Edge Cases", () => {
    it("should handle multiple languages correctly", async () => {
      const mockCountry = new CountryFacts({
        countryCode: "CH",
        countryName: "Switzerland",
        capitalCityName: "Bern",
        flagUrl: "https://flag.url",
        languages: ["German", "French", "Italian", "Romansh"],
        currency: new Currency("Swiss Franc", "CHF"),
        coordinates: new Coordinates(46.8182, 8.2275),
        maps: new MapDetails("", ""),
      });

      jest
        .mocked(dependencies.countryApiRepository.getCountryFacts)
        .mockResolvedValue(mockCountry);
      jest
        .mocked(dependencies.countryDataRepository.getNationalDish)
        .mockResolvedValue(null);
      jest
        .mocked(dependencies.populationApiRepository.getTopCityPopulations)
        .mockResolvedValue([]);

      const event = { queryStringParameters: { countryName: "Switzerland" } };
      const response = await listCountryInformationHandler(dependencies, event);

      expect(response.countryDetails.languages).toHaveLength(4);
    });
  });
});
