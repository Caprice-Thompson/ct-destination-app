import type { NationalDishRepository } from "@application/interfaces/repositories";
import { NationalDish } from "@domain/entities/national-dish";
import type { Dependencies } from "@infrastructure/dependencies";

export function makeNationalDishRepository({
  logger,
  rdsClient,
}: Pick<Dependencies, "logger" | "rdsClient">): NationalDishRepository {
  return {
    async getNationalDish(countryName: string): Promise<NationalDish | null> {
      try {
        logger.debug("Starting to fetch national dish from database", {
          countryName,
        });

        const result = await rdsClient.querySingleRowOptional<{
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
          logger.debug("No national dish found", { countryName });
          return null;
        }

        logger.info("National dish fetched successfully", { countryName });

        return new NationalDish(
          result.country_code,
          result.country_name,
          result.dish_name,
          result.image_url,
          result.description ?? undefined,
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        logger.error("Error fetching national dish from database", {
          countryName,
          error: errorMessage,
        });
        throw new Error(`Failed to fetch national dish: ${errorMessage}`);
      }
    },
  };
}
