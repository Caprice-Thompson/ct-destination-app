import { listCountryInformationQuery } from "@application/list-country-information/list-country-information-query";
import { CityPopulation } from "@domain/entities/city-population";
import {
  Coordinates,
  CountryFacts,
  Currency,
  MapDetails,
} from "@domain/entities/country-facts";
import { NationalDish } from "@domain/entities/national-dish";
import type { Dependencies } from "@infrastructure/dependencies";
import { mockDeep } from "jest-mock-extended";

describe("listCountryInformationQuery", () => {
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
        timezone: ["CET", "CEST"],
        callingCodes: ["+34"],
        drivingSide: "right",
        europeanUnionMember: true,
        schengenAreaMember: true,
      });

      const mockPopulation = [
        new CityPopulation({ cityName: "Madrid", population: 3223334 }),
        new CityPopulation({ cityName: "Barcelona", population: 1620343 }),
      ];
      const mockDish = new NationalDish(
        "ES",
        "Spain",
        "Paella",
        null,
        "A rice dish",
      );

      jest
        .mocked(dependencies.countryApiRepository.getCountryFacts)
        .mockResolvedValue(mockCountry);
      jest
        .mocked(dependencies.countryDataRepository.getNationalDish)
        .mockResolvedValue(mockDish);
      jest
        .mocked(dependencies.populationApiRepository.getTopCityPopulations)
        .mockResolvedValue(mockPopulation);

      const result = await listCountryInformationQuery(
        { countryName: "Spain" },
        dependencies,
      );
      expect(result.countryDetails).toEqual(mockCountry.toJSON());
      expect(result.cityPopulation).toEqual([
        { cityName: "Madrid", population: 3223334 },
        { cityName: "Barcelona", population: 1620343 },
      ]);
      expect(result.nationalDish).toEqual(mockDish.toJSON());

      expect(
        dependencies.countryApiRepository.getCountryFacts,
      ).toHaveBeenCalledWith("Spain");
      expect(
        dependencies.countryDataRepository.getNationalDish,
      ).toHaveBeenCalledWith("Spain");
    });

    it("should return null for population when not found in database", async () => {
      const mockCountry = new CountryFacts({
        countryCode: "XX",
        countryName: "Test Country",
        capitalCityName: "Test City",
        flagUrl: "https://flag.url",
        languages: ["Test"],
        currency: new Currency("Test", "T"),
        coordinates: new Coordinates(0, 0),
        maps: new MapDetails("", ""),
        timezone: ["CET", "CEST"],
        callingCodes: ["+34"],
        drivingSide: "right",
        europeanUnionMember: true,
        schengenAreaMember: true,
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

      const result = await listCountryInformationQuery(
        { countryName: "Test Country" },
        dependencies,
      );

      expect(result.cityPopulation).toBeUndefined();
      expect(result.nationalDish).toBeUndefined();
    });

    it("should call database queries in parallel", async () => {
      const mockCountry = new CountryFacts({
        countryCode: "FR",
        countryName: "France",
        capitalCityName: "Paris",
        flagUrl: "https://flag.url",
        languages: ["French"],
        currency: new Currency("Euro", "€"),
        coordinates: new Coordinates(46.0, 2.0),
        maps: new MapDetails("", ""),
        timezone: ["CET", "CEST"],
        callingCodes: ["+34"],
        drivingSide: "right",
        europeanUnionMember: true,
        schengenAreaMember: true,
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

      const startTime = Date.now();
      await listCountryInformationQuery(
        { countryName: "France" },
        dependencies,
      );
      const duration = Date.now() - startTime;

      expect(
        dependencies.countryDataRepository.getNationalDish,
      ).toHaveBeenCalled();

      expect(duration).toBeLessThan(100);
    });
  });

  describe("Error Handling", () => {
    it("should throw error when country is not found", async () => {
      jest
        .mocked(dependencies.countryApiRepository.getCountryFacts)
        .mockResolvedValue(null);

      await expect(
        listCountryInformationQuery(
          { countryName: "NonExistentCountry" },
          dependencies,
        ),
      ).rejects.toThrow("Country Facts not found: NonExistentCountry");

      expect(
        dependencies.countryDataRepository.getNationalDish,
      ).not.toHaveBeenCalled();
    });

    it("should propagate API repository errors", async () => {
      jest
        .mocked(dependencies.countryApiRepository.getCountryFacts)
        .mockRejectedValue(new Error("API connection failed"));

      await expect(
        listCountryInformationQuery({ countryName: "Spain" }, dependencies),
      ).rejects.toThrow("API connection failed");
    });

    it("should propagate database errors from getCityPopulation", async () => {
      const mockCountry = new CountryFacts({
        countryCode: "ES",
        countryName: "Spain",
        capitalCityName: "Madrid",
        flagUrl: "https://flag.url",
        languages: ["Spanish"],
        currency: new Currency("Euro", "€"),
        coordinates: new Coordinates(40.0, -4.0),
        maps: new MapDetails("", ""),
        timezone: ["CET", "CEST"],
        callingCodes: ["+34"],
        drivingSide: "right",
        europeanUnionMember: true,
        schengenAreaMember: true,
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

      await expect(
        listCountryInformationQuery({ countryName: "Spain" }, dependencies),
      ).rejects.toThrow("Database error");
    });

    it("should propagate database errors from getNationalDish", async () => {
      const mockCountry = new CountryFacts({
        countryCode: "ES",
        countryName: "Spain",
        capitalCityName: "Madrid",
        flagUrl: "https://flag.url",
        languages: ["Spanish"],
        currency: new Currency("Euro", "€"),
        coordinates: new Coordinates(40.0, -4.0),
        maps: new MapDetails("", ""),
        timezone: ["CET", "CEST"],
        callingCodes: ["+34"],
        drivingSide: "right",
        europeanUnionMember: true,
        schengenAreaMember: true,
      });

      jest
        .mocked(dependencies.countryApiRepository.getCountryFacts)
        .mockResolvedValue(mockCountry);
      jest
        .mocked(dependencies.countryDataRepository.getNationalDish)
        .mockRejectedValue(new Error("Database error"));

      await expect(
        listCountryInformationQuery({ countryName: "Spain" }, dependencies),
      ).rejects.toThrow("Database error");
    });
  });

  describe("Edge Cases", () => {
    it("should handle country with multiple languages", async () => {
      const mockCountry = new CountryFacts({
        countryCode: "CH",
        countryName: "Switzerland",
        capitalCityName: "Bern",
        flagUrl: "https://flag.url",
        languages: ["German", "French", "Italian", "Romansh"],
        currency: new Currency("Swiss Franc", "CHF"),
        coordinates: new Coordinates(46.8182, 8.2275),
        maps: new MapDetails("", ""),
        timezone: ["CET", "CEST"],
        callingCodes: ["+41"],
        drivingSide: "right",
        europeanUnionMember: false,
        schengenAreaMember: true,
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

      const result = await listCountryInformationQuery(
        { countryName: "Switzerland" },
        dependencies,
      );

      expect(result.countryDetails.languages).toHaveLength(4);
    });
  });
});
