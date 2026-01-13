import {
  EarthquakeRepositoryInterface,
  EarthquakeQueryParams,
  HistoricalEarthquakeRepository,
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

export type EarthquakeStatistics = {
  totalEarthquakes: number;
  monthlyEarthquakePercentage: number;
  avgTsunamiCount: number;
  avgMagnitude: number;
};
export class EarthquakeRepository implements EarthquakeRepositoryInterface {
  private readonly baseUrl: string;
  private readonly logger: Logger;
  private readonly earthquakeRepo: EarthquakeRepository;
  private readonly historicalRepo?: HistoricalEarthquakeRepository;

  constructor(baseUrl: string, logger: Logger) {
    this.baseUrl = baseUrl;
    this.logger = logger;
  }

  async getMostRecentEarthquakes(
    params: EarthquakeQueryParams,
  ): Promise<Earthquake[]> {
    try {
      const url = this.buildUrl(params);

      this.logger.debug("Fetching earthquakes from EQ API", { url });

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `EQ API returned status ${response.status}: ${response.statusText}`,
        );
      }

      const data = (await response.json()) as EqGeoJSONResponse;

      this.logger.info("Earthquakes fetched successfully from EQ API", {
        count: data.features.length,
        status: data.metadata.status,
      });

      return this.mapResponseToEarthquakes(data.features);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error("Error fetching earthquakes from EQ API", {
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
      limit: (params.limit ?? 10).toString(),
      maxradiuskm: (params.maxRadiusKm ?? 2).toString(),
      orderby: "time-asc",
    });

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
async getHistoricalEarthquakeStatistics(
    countryName: string,
    targetMonth: number
  ): Promise<EarthquakeStatistics> {
    if (!countryName || !targetMonth) {
      throw new AppError(400, "Country name and target month are required");
    }

    if (targetMonth < 1 || targetMonth > 12) {
      throw new AppError(400, "Month must be between 1 and 12");
    }

    if (!this.historicalRepo) {
      throw new AppError(500, "Historical repository not configured");
    }

    const allEarthquakes = await this.historicalRepo.getEarthquakesByCountry(countryName);

    if (allEarthquakes.length === 0) {
      return {
        totalEarthquakes: 0,
        monthlyEarthquakePercentage: 0,
        avgTsunamiCount: 0,
        avgMagnitude: 0,
      };
    }

    const earthquakesInTargetMonth = allEarthquakes.filter(eq => {
      const month = new Date(eq.date).getMonth() + 1;
      return month === targetMonth && eq.type === "earthquake";
    });

    const totalEarthquakes = allEarthquakes.length;
    const totalInMonth = earthquakesInTargetMonth.length;

    const monthlyPercentage = totalEarthquakes > 0
      ? parseFloat(((totalInMonth / totalEarthquakes) * 100).toFixed(2))
      : 0;

    const tsunamiCount = earthquakesInTargetMonth.filter(eq => eq.tsunami > 0).length;
    const avgTsunamiCount = totalInMonth > 0
      ? parseFloat((tsunamiCount / totalInMonth).toFixed(1))
      : 0;

    const sumMagnitude = earthquakesInTargetMonth.reduce(
      (sum, eq) => sum + (isNaN(eq.magnitude) ? 0 : eq.magnitude),
      0
    );
    const avgMagnitude = totalInMonth > 0
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
