import {
  EarthquakeRepositoryInterface,
  EarthquakeQueryParams,
} from "@application/interfaces/repositories";
import { Earthquake } from "@domain/entities/earthquake";
import type { Logger } from "@application/interfaces/logger";

interface EqFeatureProperties {
  mag: number;
  place: string;
  time: number;
  type: string;
  tsunami: number;
}

interface EqFeature {
  type: "Feature";
  properties: EqFeatureProperties;
  id: string;
}

interface EqGeoJSONResponse {
  type: "FeatureCollection";
  features: EqFeature[];
  metadata: {
    generated: number;
    url: string;
    title: string;
    status: number;
    count: number;
  };
}

export class EarthquakeRepository implements EarthquakeRepositoryInterface {
  private readonly baseUrl: string;
  private readonly logger: Logger;

  constructor(baseUrl: string, logger: Logger) {
    this.baseUrl = baseUrl;
    this.logger = logger;
  }

  async getMostRecentEarthquakes(
    params: EarthquakeQueryParams,
  ): Promise<Earthquake[]> {
    try {
      const url = this.buildUrl(params);

      this.logger.debug("Fetching earthquakes from USGS API", { url });

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `USGS API returned status ${response.status}: ${response.statusText}`,
        );
      }

      const data = (await response.json()) as EqGeoJSONResponse;

      this.logger.info("Earthquakes fetched successfully from USGS API", {
        count: data.features.length,
        status: data.metadata.status,
      });

      return this.mapResponseToEarthquakes(data.features);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error("Error fetching earthquakes from USGS API", {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        params,
      });
      throw new Error(
        `Failed to fetch most recent earthquakes: ${errorMessage}`,
      );
    }
  }

  private buildUrl(params: EarthquakeQueryParams): string {
    const queryParams = new URLSearchParams({
      format: "geojson",
      latitude: params.latitude.toString(),
      longitude: params.longitude.toString(),
      starttime: params.startTime,
      endtime: params.endTime,
      maxradiuskm: (params.maxRadiusKm ?? 300).toString(),
      orderby: "time-asc",
    });

    if (params.minMagnitude !== undefined) {
      queryParams.append("minmagnitude", params.minMagnitude.toString());
    }

    if (params.limit !== undefined) {
      queryParams.append("limit", params.limit.toString());
    }

    return `${this.baseUrl}?${queryParams.toString()}`;
  }

  private mapResponseToEarthquakes(features: EqFeature[]): Earthquake[] {
    return features.map((feature) => {
      return new Earthquake({
        name: feature.properties.place,
        magnitude: feature.properties.mag,
        date: new Date(feature.properties.time).toISOString().split("T")[0],
        type: feature.properties.type,
        tsunami: feature.properties.tsunami,
      });
    });
  }
}
