import {
  EarthquakeRepositoryInterface,
  EarthquakeQueryParams,
} from "@application/interfaces/repositories";
import { Earthquake } from "@domain/entities/earthquake";
import { findCountryInString } from "@domain/utils/country-extractor";
import { Dependencies } from "@infrastructure/dependencies";

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
  geometry: {
    type: "Point";
    coordinates: [number, number, number]; // [longitude, latitude, depth]
  };
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

export type EarthquakeStatistics = {
  totalEarthquakes: number;
  monthlyEarthquakePercentage: number;
  avgTsunamiCount: number;
  avgMagnitude: number;
};
export class EarthquakeRepository implements EarthquakeRepositoryInterface {
  private readonly dependencies: Pick<
    Dependencies,
    "config" | "logger" | "historicalEarthquakeRepository"
  >;

  constructor(
    dependencies: Pick<
      Dependencies,
      "config" | "logger" | "historicalEarthquakeRepository"
    >,
  ) {
    this.dependencies = dependencies;
  }

  async getMostRecentEarthquakesByCountry(
    params: EarthquakeQueryParams,
  ): Promise<Earthquake[]> {
    try {
      const url = this.buildUrlForCountry(params);

      this.dependencies.logger.debug("Fetching earthquakes from EQ API", {
        url,
      });

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `EQ API returned status ${response.status}: ${response.statusText}`,
        );
      }

      const data = (await response.json()) as EqGeoJSONResponse;

      this.dependencies.logger.info(
        "Earthquakes fetched successfully from EQ API",
        {
          count: data.features.length,
          status: data.metadata.status,
        },
      );

      return data.features.map((feature) => {
        return new Earthquake({
          eventId: feature.id,
          name: feature.properties.place,
          magnitude: feature.properties.mag,
          date: new Date(feature.properties.time).toISOString().split("T")[0],
          type: feature.properties.type,
          tsunami: feature.properties.tsunami,
          place: feature.properties.place,
          country: params.countryName!, // Use the country from params
        });
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.dependencies.logger.error("Error fetching earthquakes from EQ API", {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        params,
      });
      throw new Error(
        `Failed to fetch most recent earthquakes: ${errorMessage}`,
      );
    }
  }

  async getEarthquakeIngestData(
    params: Pick<EarthquakeQueryParams, "startTime" | "endTime">,
  ): Promise<Earthquake[]> {
    try {
      const url = this.buildUrlForIngest(params);

      this.dependencies.logger.debug("Fetching earthquakes from EQ API", {
        url,
      });

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `EQ API returned status ${response.status}: ${response.statusText}`,
        );
      }

      const data = (await response.json()) as EqGeoJSONResponse;

      this.dependencies.logger.info(
        "Earthquakes fetched successfully from EQ API",
        {
          count: data.features.length,
          status: data.metadata.status,
        },
      );
      return this.mapResponseToEarthquakesWithoutGeocoding(data.features);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.dependencies.logger.error("Error fetching earthquakes from EQ API", {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        params,
      });
      throw new Error(
        `Failed to fetch earthquakes for ingest: ${errorMessage}`,
      );
    }
  }

  private buildUrlForCountry(params: EarthquakeQueryParams): string {
    const queryParams = new URLSearchParams({
      format: "geojson",
      latitude: params.latitude.toString(),
      longitude: params.longitude.toString(),
      starttime: params.startTime,
      endtime: params.endTime,
      limit: (params.limit ?? 10).toString(),
      maxradiuskm: (params.maxRadiusKm ?? 2).toString(),
      orderby: "time-asc",
    });

    return `${this.dependencies.config.urls.earthquakesApi}?${queryParams.toString()}`;
  }

  private buildUrlForIngest(
    params: Pick<EarthquakeQueryParams, "startTime" | "endTime">,
  ): string {
    const queryParams = new URLSearchParams({
      format: "geojson",
      starttime: params.startTime,
      endtime: params.endTime,
      latitude: "55.0",
      longitude: "25.0",
      maxradiuskm: "4100",
      limit: "13000",
      minmagnitude: "3.0",
      orderby: "time-asc",
    });

    return `${this.dependencies.config.urls.earthquakesApi}?${queryParams.toString()}`;
  }

  private mapResponseToEarthquakesWithoutGeocoding(
    features: EqFeature[],
  ): Earthquake[] {
    return features.map((feature) => {
      const place = feature.properties.place;

      // Extract country from place string only (no geocoding API call)
      const country = findCountryInString(place);

      return new Earthquake({
        eventId: feature.id,
        name: place,
        magnitude: feature.properties.mag,
        date: new Date(feature.properties.time).toISOString().split("T")[0],
        type: feature.properties.type,
        tsunami: feature.properties.tsunami,
        place: place,
        country: country, // Will be empty if not found in place string
      });
    });
  }

  // private async mapResponseToEarthquakes(
  //   features: EqFeature[],
  // ): Promise<Earthquake[]> {
  //   const earthquakes: Earthquake[] = [];

  //   for (const feature of features) {
  //     const place = feature.properties.place;

  //     const [longitude, latitude] = feature.geometry.coordinates;

  //     let country = await retrieveCountryFromCoordinates(latitude, longitude);

  //     if (!country) {
  //       country = findCountryInString(place);
  //     }

  //     earthquakes.push(
  //       new Earthquake({
  //         eventId: feature.id,
  //         name: place,
  //         magnitude: feature.properties.mag,
  //         date: new Date(feature.properties.time).toISOString().split("T")[0],
  //         type: feature.properties.type,
  //         tsunami: feature.properties.tsunami,
  //         place: place,
  //         country: country,
  //       }),
  //     );
  //   }

  //   return earthquakes;
  // }
  async getHistoricalEarthquakeStatistics(
    countryName: string,
    targetMonth: number,
  ): Promise<EarthquakeStatistics> {
    const allEarthquakes =
      await this.dependencies.historicalEarthquakeRepository.getEarthquakesByCountry(
        countryName,
      );

    if (allEarthquakes.length === 0) {
      return {
        totalEarthquakes: 0,
        monthlyEarthquakePercentage: 0,
        avgTsunamiCount: 0,
        avgMagnitude: 0,
      };
    }

    const earthquakesInTargetMonth = allEarthquakes.filter((eq) => {
      const month = new Date(eq.date).getMonth() + 1;
      return month === targetMonth && eq.type === "earthquake";
    });

    const totalEarthquakes = allEarthquakes.length;
    const totalInMonth = earthquakesInTargetMonth.length;

    const monthlyPercentage =
      totalEarthquakes > 0
        ? parseFloat(((totalInMonth / totalEarthquakes) * 100).toFixed(2))
        : 0;

    const tsunamiCount = earthquakesInTargetMonth.filter(
      (eq) => eq.tsunami > 0,
    ).length;
    const avgTsunamiCount =
      totalInMonth > 0
        ? parseFloat((tsunamiCount / totalInMonth).toFixed(1))
        : 0;

    const sumMagnitude = earthquakesInTargetMonth.reduce(
      (sum, eq) => sum + (isNaN(eq.magnitude) ? 0 : eq.magnitude),
      0,
    );
    const avgMagnitude =
      totalInMonth > 0
        ? parseFloat((sumMagnitude / totalInMonth).toFixed(1))
        : 0;

    return {
      totalEarthquakes,
      monthlyEarthquakePercentage: monthlyPercentage,
      avgTsunamiCount,
      avgMagnitude,
    };
  }

  async enrichEarthquakesWithCountry(
    earthquakes: Earthquake[],
  ): Promise<Earthquake[]> {
    const enriched: Earthquake[] = [];

    for (const eq of earthquakes) {
      if (eq.country) {
        enriched.push(eq);
        continue;
      }

      const country = findCountryInString(eq.place) || "Unknown";

      enriched.push(
        new Earthquake({
          ...eq,
          country: country,
        }),
      );
    }

    this.dependencies.logger.info("Enriched earthquakes with country data", {
      count: enriched.length,
    });

    return enriched;
  }
}
