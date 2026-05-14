import type { CoordinatesRepository } from "@application/interfaces/repositories";
import { Coordinates } from "@domain/entities/coordinates";
import type { Dependencies } from "@infrastructure/dependencies";

interface CoordinatesResponse {
  name: {
    common: string;
    official: string;
  };
  latlng?: [number, number];
}

export function makeCoordinatesRepository({
  config,
  logger,
}: Pick<Dependencies, "config" | "logger">): CoordinatesRepository {
  return {
    async getCoordinatesByCountryName(
      countryName: string,
    ): Promise<Coordinates> {
      try {
        const url = `${config.urls.restCountriesApiUrl}/name/${encodeURIComponent(countryName)}`;
        logger.debug("Starting to fetch coordinates from REST Countries API", {
          countryName,
          url,
        });

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch coordinates from REST Countries API: ${response.status} ${response.statusText}`,
          );
        }

        const data = (await response.json()) as CoordinatesResponse[];

        const countryData = data[0];

        if (!countryData.latlng) {
          throw new Error(
            `No coordinates available for country: ${countryName}`,
          );
        }

        const coordinates = new Coordinates({
          latitude: countryData.latlng[0],
          longitude: countryData.latlng[1],
        });

        logger.info("Coordinates fetched successfully", {
          countryName,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        });

        return coordinates;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        logger.error("Error fetching coordinates from REST Countries API", {
          countryName,
          error: errorMessage,
        });
        throw error;
      }
    },
  };
}
