import type { ExternalWeatherAPIService } from "@application/interfaces";
import { Temperature, WeatherData } from "@domain/entities/weather";
import type { Dependencies } from "@infrastructure/dependencies";

type ExternalWeatherApiItem = {
  countryCode?: string;
  countryName?: string;
  date: string;
  wind?: string;
  temperature?: number | { min: number; max: number };
  humidity?: string;
  pressure?: string;
  visibility?: string;
  windSpeed?: string;
};

type ExternalWeatherApiResponse = {
  data?: ExternalWeatherApiItem[];
};

type WeatherRequestParams = {
  latitude: number;
  longitude: number;
  startTime: string;
  endTime: string;
  maxRadiusKm?: number;
  limit?: number;
};

function mapTemperature(
  temperature: ExternalWeatherApiItem["temperature"],
): Temperature {
  if (typeof temperature === "number") {
    return new Temperature(temperature, temperature);
  }

  return new Temperature(temperature?.min ?? 0, temperature?.max ?? 0);
}

export function makeExternalWeatherAPIService({
  config,
  logger,
}: Pick<Dependencies, "config" | "logger">): ExternalWeatherAPIService {
  const buildUrl = (params: WeatherRequestParams): string => {
    const url = new URL(config.urls.externalWeatherAPI);

    url.searchParams.set("latitude", `${params.latitude}`);
    url.searchParams.set("longitude", `${params.longitude}`);
    url.searchParams.set("startTime", params.startTime);
    url.searchParams.set("endTime", params.endTime);
    if (params.maxRadiusKm)
      url.searchParams.set("maxRadiusKm", `${params.maxRadiusKm}`);
    if (params.limit) url.searchParams.set("limit", `${params.limit}`);

    return url.toString();
  };

  const getWeatherData = async (
    params: WeatherRequestParams,
  ): Promise<WeatherData[]> => {
    const weatherUrl = buildUrl(params);
    logger.info("Fetching weather data from external API", {
      weatherUrl,
      ...params,
    });

    const response = await fetch(weatherUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch weather data: ${response.statusText}`);
    }

    const responseBody = (await response.json()) as ExternalWeatherApiResponse;
    const rows = responseBody.data ?? [];

    return rows.map(
      (item) =>
        new WeatherData(
          item.countryCode ?? "",
          item.countryName ?? "",
          item.date,
          item.wind ?? "",
          mapTemperature(item.temperature),
          item.humidity ?? "",
          item.pressure ?? "",
          item.visibility ?? "",
          item.windSpeed ?? "",
        ),
    );
  };

  return {
    getWeatherData,
  };
}
