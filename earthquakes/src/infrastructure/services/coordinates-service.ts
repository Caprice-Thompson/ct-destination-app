import type { CoordinatesRepository } from "@application/interfaces/repositories";
import { Coordinates } from "@domain/entities/coordinates";
import type { Dependencies } from "@infrastructure/dependencies";

interface CoordinatesApiResponse {
  data: {
    objects: Array<{
      coordinates: {
        lat: number;
        lng: number;
      };
    }>;
  };
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
        const url = `${config.urls.restCountriesApiUrl}?names.common=${encodeURIComponent(countryName)}`;
        logger.debug("Starting to fetch coordinates from REST Countries API", {
          countryName,
          url,
        });
        console.log("url", url);
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${config.urls.restCountriesAuthorization}`,
          },
        });
        console.log("response", response);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch coordinates from REST Countries API: ${response.status} ${response.statusText}`,
          );
        }

        const data = (await response.json()) as CoordinatesApiResponse;

        if (!data.data?.objects?.[0]?.coordinates) {
          throw new Error(
            `No coordinates available for country: ${countryName}`,
          );
        }

        const countryData = data.data.objects[0];

        const coordinates = new Coordinates({
          latitude: countryData.coordinates.lat,
          longitude: countryData.coordinates.lng,
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
