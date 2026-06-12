import type { UsgsService } from "@application/interfaces";
import {
  Earthquake,
  type EarthquakeProperties,
} from "@domain/entities/earthquake";
import type { Dependencies } from "@infrastructure/dependencies";

interface UsgsApiEarthquakeProperties {
  mag: number;
  place: string;
  time: number;
  type: string;
  tsunami: number;
  title: string;
}

interface UsgsApiEarthquakeFeature {
  id: string;
  properties: UsgsApiEarthquakeProperties;
}

interface UsgsApiResponse {
  type: string;
  metadata: {
    generated: number;
    url: string;
    title: string;
    status: number;
    api: string;
    count: number;
  };
  features: UsgsApiEarthquakeFeature[];
}

export function makeUsgsService({
  config,
  logger,
}: Pick<Dependencies, "config" | "logger">): UsgsService {
  const buildUrl = (params: {
    latitude: number;
    longitude: number;
    startTime: string;
    endTime: string;
    maxRadiusKm?: number;
    minMagnitude?: number;
    limit?: number;
  }): string => {
    const url = new URL(config.urls.usgsApi);

    url.searchParams.set("format", "geojson");
    url.searchParams.set("starttime", params.startTime);
    url.searchParams.set("endtime", params.endTime);
    url.searchParams.set("latitude", `${params.latitude}`);
    url.searchParams.set("longitude", `${params.longitude}`);
    if (params.maxRadiusKm)
      url.searchParams.set("maxradiuskm", `${params.maxRadiusKm}`);
    if (params.minMagnitude)
      url.searchParams.set("minmagnitude", `${params.minMagnitude}`);
    if (params.limit) url.searchParams.set("limit", `${params.limit}`);

    return url.toString();
  };

  const fetchEarthquakes = async (params: {
    latitude: number;
    longitude: number;
    startTime: string;
    endTime: string;
    maxRadiusKm?: number;
    minMagnitude?: number;
    limit?: number;
  }): Promise<Earthquake[]> => {
    const usgsUrl = buildUrl(params);
    logger.info("Fetching earthquakes from USGS API", { usgsUrl, ...params });

    const response = await fetch(usgsUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch earthquake data from USGS: ${response.statusText}`,
      );
    }

    const data = (await response.json()) as UsgsApiResponse;

    if (!data.features || !Array.isArray(data.features)) {
      throw new Error("Invalid USGS API response format");
    }

    const earthquakes: Earthquake[] = data.features.map((feature) => {
      const p = feature.properties;
      const eqProps: EarthquakeProperties = {
        eventId: feature.id,
        name: p.title,
        magnitude: p.mag,
        date: new Date(p.time).toISOString(),
        type: p.type,
        tsunami: p.tsunami,
        place: p.place,
        country: "",
      };
      return new Earthquake(eqProps);
    });

    logger.info(`Mapped ${earthquakes.length} earthquakes`);
    return earthquakes;
  };

  return {
    async listEarthquakes(params: {
      latitude: number;
      longitude: number;
      startTime: string;
      endTime: string;
      maxRadiusKm?: number;
      minMagnitude?: number;
      limit?: number;
    }): Promise<Earthquake[]> {
      return await fetchEarthquakes(params);
    },
  };
}
