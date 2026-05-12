import type { CityPopulation } from "@domain/entities/city-population";
import type { CountryFacts } from "@domain/entities/country-facts";
import type { NationalDish } from "@domain/entities/national-dish";

export interface CountryApiRepositoryInterface {
  getCountryFacts(countryName: string): Promise<CountryFacts | null>;
}

export interface CountryDatabaseRepositoryInterface {
  getNationalDish(countryName: string): Promise<NationalDish | null>;
  getCityPopulationsFromDB(
    countryName: string,
  ): Promise<CityPopulation[] | null>;
}
export interface PopulationApiRepositoryInterface {
  getTopCityPopulations(countryName: string): Promise<CityPopulation[]>;
}
