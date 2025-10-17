import { CountryDetail } from '@domain/entities/country-detail';

export interface CountryRepository {
  getCountryDetails(countryCode: string): Promise<CountryDetail[]>;
}
