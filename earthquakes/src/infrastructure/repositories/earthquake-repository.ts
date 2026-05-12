import type {
  EarthquakeQueryParams,
  EarthquakeRepository,
} from "@application/interfaces/repositories";
import { Earthquake } from "@domain/entities/earthquake";
import { findCountryInString } from "@application/common/country-extractor";
import type { Dependencies } from "@infrastructure/dependencies";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
// some of this needs to be moved to domain then delete file
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

export type EarthquakeStatistics = {
  totalEarthquakes: number;
  monthlyEarthquakePercentage: number;
  avgTsunamiCount: number;
  avgMagnitude: number;
};

export function makeEarthquakeRepository(dependencies: Dependencies): EarthquakeRepository {
  const dynamoDBClient = new DynamoDBClient();
  return {
    async listLatestEarthquakesByCountry(
      params: EarthquakeQueryParams,
    ): Promise<Earthquake[]> {
      try {
        const url = buildUrlForCountry(params);
  
        dependencies.logger.debug("Fetching earthquakes from EQ API", {
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
  
        return this.mapResponseToEarthquakes(data.features);
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
  }
}
export class EarthquakeRepository implements EarthquakeRepository {
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

  async listLatestEarthquakesByCountry(
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

      return this.mapResponseToEarthquakes(data.features);
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

  async getEarthquakeData(
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

      return this.mapResponseToEarthquakes(data.features);
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
      orderby: "time-asc",
    });

    return `${this.dependencies.config.urls.earthquakesApi}?${queryParams.toString()}`;
  }

  private mapResponseToEarthquakes(features: EqFeature[]): Earthquake[] {
    return features.map((feature) => {
      const place = feature.properties.place;
      const country = findCountryInString(place);

      return new Earthquake({
        eventId: feature.id,
        name: place,
        magnitude: feature.properties.mag,
        date: new Date(feature.properties.time).toISOString().split("T")[0],
        type: feature.properties.type,
        tsunami: feature.properties.tsunami,
        place: place,
        country: country,
      });
    });
  }
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
}
