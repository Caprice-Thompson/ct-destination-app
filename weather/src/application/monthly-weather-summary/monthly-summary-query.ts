import type { Dependencies } from "@infrastructure/dependencies";
import { validateMonthlyWeatherSummaryRequest } from "./monthly-summary-query-validator";

export type GetMonthlyWeatherSummaryQuery = Readonly<{
  countryName: string;
  month: string;
}>;

export type MonthlyWeatherSummary = {
  countryName: string;
  month: string;
  totalWeatherRecords: number;
  averageMinTemperature: number;
  averageMaxTemperature: number;
};

export async function getMonthlyWeatherSummary(
  query: GetMonthlyWeatherSummaryQuery,
  dependencies: Dependencies,
): Promise<MonthlyWeatherSummary> {
  const { weatherRepository, logger } = dependencies;

  logger.info("Starting get monthly weather summary query", { query });

  const { countryName, month } =
    await validateMonthlyWeatherSummaryRequest(query);

  const weatherData = await weatherRepository.getWeatherDataByCountry(
    countryName,
    month,
  );

  if (weatherData.length === 0) {
    return {
      countryName,
      month,
      totalWeatherRecords: 0,
      averageMinTemperature: 0,
      averageMaxTemperature: 0,
    };
  }

  const totals = weatherData.reduce(
    (acc, weather) => ({
      min: acc.min + weather.temperature.min,
      max: acc.max + weather.temperature.max,
    }),
    { min: 0, max: 0 },
  );

  return {
    countryName,
    month,
    totalWeatherRecords: weatherData.length,
    averageMinTemperature: totals.min / weatherData.length,
    averageMaxTemperature: totals.max / weatherData.length,
  };
}
