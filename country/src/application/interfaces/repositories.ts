import { CountryFacts } from '@domain/entities/country-detail';
import { CityPopulation } from '@domain/entities/city-population';
import { NationalDish } from '@domain/entities/national-dish';

export interface CountryApiRepositoryInterface {
  getCountryDetailsByName(countryName: string): Promise<CountryFacts | null>;
}

export interface CountryDatabaseRepositoryInterface {
  getTopCityPopulations(countryName: string): Promise<CityPopulation | null>;
  getNationalDish(countryName: string): Promise<NationalDish | null>;
}

export interface PopulationApiRepositoryInterface {
  getTopCityPopulations(countryName: string): Promise<CityPopulation | null>;
}
