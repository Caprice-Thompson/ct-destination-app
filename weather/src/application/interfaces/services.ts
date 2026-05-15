import type { WeatherData } from "@domain/entities/weather";

export interface ExternalWeatherAPIService {
  getWeatherData(params: {
    latitude: number;
    longitude: number;
    startTime: string;
    endTime: string;
    maxRadiusKm?: number;
    limit?: number;
  }): Promise<WeatherData[]>;
}
