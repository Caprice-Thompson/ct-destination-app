import type { CoordinatesRepositoryInterface } from "@application/interfaces/repositories";
import { Coordinates } from "@domain/entities/coordinates";
import type { Dependencies } from "@infrastructure/dependencies";

interface RestCountriesApiResponse {
  name: {
    common: string;
    official: string;
  };
  latlng?: [number, number];
}

export class CoordinatesRepository implements CoordinatesRepositoryInterface {
  private readonly dependencies: Pick<Dependencies, "config" | "logger">;

  constructor(dependencies: Pick<Dependencies, "config" | "logger">) {
    this.dependencies = dependencies;
  }

  async getCoordinatesByCountryName(countryName: string): Promise<Coordinates> {
    try {
      const url = `${this.dependencies.config.urls.restCountriesApiUrl}/${encodeURIComponent(countryName)}`;

      this.dependencies.logger.debug(
        "Fetching coordinates from REST Countries API",
        {
          countryName,
          url,
        },
      );

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status} ${response.statusText}`,
        );
      }

      const data = (await response.json()) as RestCountriesApiResponse[];

      const countryData = data[0];

      if (!countryData.latlng) {
        throw new Error(`No coordinates available for country: ${countryName}`);
      }

      const coordinates = new Coordinates({
        latitude: countryData.latlng[0],
        longitude: countryData.latlng[1],
      });

      this.dependencies.logger.info("Coordinates fetched successfully", {
        countryName,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      });

      return coordinates;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.dependencies.logger.error(
        "Error fetching coordinates from REST Countries API",
        {
          error: errorMessage,
          stack: error instanceof Error ? error.stack : undefined,
          countryName,
        },
      );
      throw new Error(
        `Failed to fetch coordinates for country "${countryName}": ${errorMessage}`,
      );
    }
  }
}
