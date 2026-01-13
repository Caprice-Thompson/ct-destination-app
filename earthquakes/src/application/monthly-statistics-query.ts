import { EarthquakeStatistics } from "@domain/earthquake";
import { Dependencies } from "@infrastructure/dependencies";

export type GetMonthlyEarthquakeStatisticsQuery = {
  countryName: string;
  month: string;
};

export async function getMonthlyEarthquakeStatisticsQuery(
  query: GetMonthlyEarthquakeStatisticsQuery,
  dependencies: Dependencies
): Promise<EarthquakeStatistics> {
  const { earthquakeDomain } = dependencies;

  const monthNumber = parseInt(query.month, 10);

  if (isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) {
    throw new Error("Validation error: Month must be a number between 1 and 12");
  }

  return await earthquakeDomain.getHistoricalEarthquakeStatistics(
    query.countryName,
    monthNumber
  );
}