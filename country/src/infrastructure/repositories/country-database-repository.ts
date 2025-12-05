import { CountryDatabaseRepositoryInterface } from '@application/interfaces/repositories';
import { CityPopulation } from '@domain/entities/city-population';
import { NationalDish } from '@domain/entities/national-dish';
import { DbClient } from './db/rds_client';
import { logger } from '@infrastructure/logger';

export class CountryDatabaseBRepository implements CountryDatabaseRepositoryInterface {
  constructor(private readonly dbClient: DbClient) {}

  async getTopCityPopulations(countryName: string): Promise<CityPopulation | null> {
    try {
      const result = await this.dbClient.querySingleRowOptional<{
        city_name: string;
        country_code: string;
        population: number;
      }>({
        query: `
          SELECT city_name, country_code, population
          FROM city_populations
          WHERE country_name = $1
          ORDER BY CAST(REPLACE(population, ',', '') AS NUMERIC) DESC LIMIT 4;
        `,
        bindVariables: [countryName],
      });

      if (!result) {
        return null;
      }

      return new CityPopulation({
        cityName: result.city_name,
        countryCode: result.country_code,
        population: result.population,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.debug('Error fetching city population', {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new Error(`Failed to fetch city population: ${errorMessage}`);
    }
  }

  async getNationalDish(countryName: string): Promise<NationalDish | null> {
    try {
      const result = await this.dbClient.querySingleRowOptional<{
        country_name: string;
        dish_name: string;
        image_url: string | null;
        description: string | null;
      }>({
        query: `
          SELECT country_name, dish_name, image_url, description
          FROM national_dishes
          WHERE country_name = $1
        `,
        bindVariables: [countryName],
      });

      if (!result) {
        return null;
      }

      return new NationalDish(result.country_name, result.dish_name, result.image_url, result.description ?? undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.debug('Error fetching national dish', {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new Error(`Failed to fetch national dish: ${errorMessage}`);
    }
  }

  async saveCityPopulation(cityPopulation: CityPopulation, countryName: string): Promise<void> {
    try {
      await this.dbClient.update({
        query: `
          INSERT INTO city_populations (city_name, country_code, country_name, population)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (city_name, country_name)
          DO UPDATE SET 
            population = EXCLUDED.population,
            updated_at = CURRENT_TIMESTAMP
        `,
        bindVariables: [cityPopulation.cityName, cityPopulation.countryCode, countryName, cityPopulation.population],
      });

      logger.info('Successfully saved city population', {
        cityName: cityPopulation.cityName,
        countryName,
        population: cityPopulation.population,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error saving city population', {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new Error(`Failed to save city population: ${errorMessage}`);
    }
  }

  async saveNationalDish(nationalDish: NationalDish): Promise<void> {
    try {
      await this.dbClient.update({
        query: `
          INSERT INTO national_dishes (country_name, dish_name, image_url, description)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (country_name)
          DO UPDATE SET 
            dish_name = EXCLUDED.dish_name,
            image_url = EXCLUDED.image_url,
            description = EXCLUDED.description,
            updated_at = CURRENT_TIMESTAMP
        `,
        bindVariables: [
          nationalDish.countryCode,
          nationalDish.dishName,
          nationalDish.imageUrl,
          nationalDish.description ?? null,
        ],
      });

      logger.info('Successfully saved national dish', {
        countryName: nationalDish.countryCode,
        dishName: nationalDish.dishName,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error saving national dish', {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new Error(`Failed to save national dish: ${errorMessage}`);
    }
  }
}
