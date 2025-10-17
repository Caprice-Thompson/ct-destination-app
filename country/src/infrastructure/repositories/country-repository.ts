import { CountryRepository } from '@application/interfaces/repositories';
import { CountryDetail } from '@domain/entities/country-detail';

// Think about strcuturing this better, use Document DB , mongo
export interface DynamoDBCountryItem {
  country_code: string;
  country_name: string;
  capital_city_name: string;
  top_city_names: string[];
  top_city_populations: number[];
  flag_url: string;
  language_spoken: string[];
  currency_name: string;
  currency_symbol: string;
  created_at: string;
  updated_at: string;
}

export function makeCountryRepository(): CountryRepository {
  return {
    async getCountryDetails(countryCode) {
      if (!countryCode.length) {
        return [];
      }
      const result = await dynamoDB.get({
        TableName: 'countries',
        Key: { country_code: countryCode },
      });

      return result.Item as CountryDetail;
    },
  };
}
