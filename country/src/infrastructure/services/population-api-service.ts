import type { PopulationApiService } from "@application/interfaces/services";
import { CityPopulation } from "@domain/entities/city-population";
import type { Dependencies } from "@infrastructure/dependencies";

interface PopulationAPIResponse {
  total_count: number;
  results: Array<{
    geoname_id: string;
    name: string;
    ascii_name: string;
    alternate_names: string[];
    feature_class: string;
    feature_code: string;
    country_code: string;
    cou_name_en: string;
    population: number;
    timezone: string;
    coordinates: {
      lon: number;
      lat: number;
    };
  }>;
}

export function makePopulationApiService({
  config,
  logger,
}: Pick<Dependencies, "config" | "logger">): PopulationApiService {
  return {
    async getTopCityPopulations(
      countryName: string,
    ): Promise<CityPopulation[]> {
      const params = new URLSearchParams({
        order_by: "population DESC",
        limit: "4",
        refine: 'timezone:"Europe"',
        where: `cou_name_en='${countryName.replace(/'/g, "\\'")}'`,
      });
      const url = `${config.api.populationApiUrl}?${params.toString()}`;

      try {
        logger.debug(
          "Starting to fetch top city populations from Population API",
          {
            countryName,
            url,
          },
        );

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(
            `API request failed with status ${response.status} ${response.statusText}`,
          );
        }

        const data: PopulationAPIResponse = await response.json();

        logger.info("City populations fetched successfully", {
          countryName,
          resultsCount: data.results.length,
        });

        return data.results.map(
          (result) =>
            new CityPopulation({
              cityName: result.name,
              population: result.population,
            }),
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        logger.error(
          "Error fetching top city populations from Population API",
          {
            countryName,
            error: errorMessage,
          },
        );
        throw new Error(
          `Failed to fetch top city populations: ${errorMessage}`,
        );
      }
    },
  };
}
