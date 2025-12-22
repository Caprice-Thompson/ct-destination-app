import { CountryDatabaseRepositoryInterface } from '@application/interfaces/repositories';
import { NationalDish } from '@domain/entities/national-dish';
import { DbClient } from './db/rds_client';
import { logger } from '@infrastructure/logger';

export class CountryDatabaseBRepository implements CountryDatabaseRepositoryInterface {
  constructor(private readonly dbClient: DbClient) {}

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
          FROM national_dish
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

  async saveNationalDish(nationalDish: NationalDish): Promise<void> {
    try {
      await this.dbClient.update({
        query: `
          INSERT INTO national_dish (country_name, dish_name, image_url, description)
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
