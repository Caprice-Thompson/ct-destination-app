import type { Dependencies } from "@infrastructure/dependencies";
import { validateMonthlyEarthquakeStatisticsRequest } from "./monthly-statistics-query-validator";


export type MonthlyEarthquakeStatisticsQuery = Readonly<{
  countryName: string;
  month: string;
}>;

export type EarthquakeStatistics = {
  totalEarthquakes: number;
  monthlyEarthquakePercentage: number;
  avgTsunamiCount: number;
  avgMagnitude: number;
};

export async function getMonthlyEarthquakeStatisticsQuery(
  query: MonthlyEarthquakeStatisticsQuery,
  dependencies: Dependencies,
): Promise<EarthquakeStatistics> {
  const { earthquakeRepository, logger } = dependencies;

  logger.info("Starting get monthly earthquake statistics query", { query });

  const { countryName, month } =
    await validateMonthlyEarthquakeStatisticsRequest(query);

  return await earthquakeRepository.getHistoricalEarthquakeStatistics(
    countryName,
    parseInt(month, 10),
  );
}
