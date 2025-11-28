import { CountryDataRepository } from '@application/interfaces/repositories';
import { CityPopulation } from '@domain/entities/city-population';
import { NationalDish } from '@domain/entities/national-dish';
import { DbClient } from './db/rds_client';
import { logger } from '@infrastructure/logger';

export class CountryDBRepository implements CountryDataRepository {
  constructor(private readonly dbClient: DbClient) {}

  async getCityPopulation(cityName: string, countryCode: string): Promise<CityPopulation | null> {
    try {
      const result = await this.dbClient.querySingleRowOptional<{
        city_name: string;
        country_code: string;
        population: number;
      }>({
        query: `
          SELECT city_name, country_code, population
          FROM city_populations
          WHERE city_name = $1 AND country_code = $2
        `,
        bindVariables: [cityName, countryCode],
      });

      if (!result) {
        return null;
      }

      return new CityPopulation(result.city_name, result.country_code, result.population);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.debug('Error fetching city population', {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new Error(`Failed to fetch city population: ${errorMessage}`);
    }
  }

  async getNationalDish(countryCode: string): Promise<NationalDish | null> {
    try {
      const result = await this.dbClient.querySingleRowOptional<{
        country_code: string;
        dish_name: string;
        description: string | null;
      }>({
        query: `
          SELECT country_code, dish_name, description
          FROM national_dishes
          WHERE country_code = $1
        `,
        bindVariables: [countryCode],
      });

      if (!result) {
        return null;
      }

      return new NationalDish(result.country_code, result.dish_name, result.description || undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.debug('Error fetching national dish', {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new Error(`Failed to fetch national dish: ${errorMessage}`);
    }
  }
}
