import { CountryDetail } from '@domain/entities/country-detail';
import { CityPopulation } from '@domain/entities/city-population';
import { NationalDish } from '@domain/entities/national-dish';

// Repository for external REST Countries API
export interface CountryApiRepository {
  getCountryDetailsByName(countryName: string): Promise<CountryDetail | null>;
}

export interface CountryDataRepository {
  getCityPopulation(cityName: string, countryCode: string): Promise<CityPopulation | null>;
  getNationalDish(countryCode: string): Promise<NationalDish | null>;
}
