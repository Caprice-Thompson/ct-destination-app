import type { CountryDatabaseRepositoryInterface } from "@application/interfaces/repositories";
import { CityPopulation } from "@domain/entities/city-population";
import { NationalDish } from "@domain/entities/national-dish";
import { logger } from "@infrastructure/logger";
import type { DbClient } from "./db/rds_client";

export class CountryDatabaseBRepository
  implements CountryDatabaseRepositoryInterface
{
  constructor(private readonly dbClient: DbClient) {}

  async getNationalDish(countryName: string): Promise<NationalDish | null> {
    try {
      const result = await this.dbClient.querySingleRowOptional<{
        country_name: string;
        country_code: string;
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

      return new NationalDish(
        result.country_code,
        result.country_name,
        result.dish_name,
        result.image_url,
        result.description ?? undefined,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      logger.debug("Error fetching national dish", {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new Error(`Failed to fetch national dish: ${errorMessage}`);
    }
  }

  async getCityPopulationsFromDB(
    countryName: string,
  ): Promise<CityPopulation[] | null> {
    try {
      const result = await this.dbClient.queryMultipleRows<CityPopulation>({
        query: `
          SELECT city_name, population
          FROM city_populations
          WHERE country_name = $1
        `,
        bindVariables: [countryName],
        rowMapper: (row) =>
          new CityPopulation({
            cityName: String(row.city_name),
            population: Number(row.population),
          }),
      });
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      logger.debug("Error fetching city populations from database", {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new Error(
        `Failed to fetch city populations from database: ${errorMessage}`,
      );
    }
  }
}
