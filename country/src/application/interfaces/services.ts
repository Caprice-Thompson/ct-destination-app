import type { CityPopulation } from "@domain/entities/city-population";
import type { CountryFacts } from "@domain/entities/country-facts";

export interface PopulationApiService {
  getTopCityPopulations(countryName: string): Promise<CityPopulation[]>;
}
export interface CountryRestApiService {
  getCountryFacts(countryName: string): Promise<CountryFacts | null>;
}
