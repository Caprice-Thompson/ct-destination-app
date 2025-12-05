import { CountryFacts } from '@domain/entities/country-facts';
import { CityPopulation } from '@domain/entities/city-population';
import { NationalDish } from '@domain/entities/national-dish';

export interface CountryApiRepositoryInterface {
  getCountryFacts(countryName: string): Promise<CountryFacts | null>;
}

export interface CountryDatabaseRepositoryInterface {
  getTopCityPopulations(countryName: string): Promise<CityPopulation | null>;
  getNationalDish(countryName: string): Promise<NationalDish | null>;
  saveCityPopulation(cityPopulation: CityPopulation, countryName: string): Promise<void>;
  saveNationalDish(nationalDish: NationalDish): Promise<void>;
}
// trade off
export interface PopulationApiRepositoryInterface {
  getTopCityPopulations(countryName: string): Promise<CityPopulation | null>;
}
