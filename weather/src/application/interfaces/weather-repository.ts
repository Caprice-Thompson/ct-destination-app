import type { WeatherData } from "@domain/entities/weather";

export interface WeatherRepository {
  getWeatherDataByCountry(
    countryName: string,
    month: string,
  ): Promise<WeatherData[]>;
}
