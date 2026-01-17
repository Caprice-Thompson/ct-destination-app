import { EarthquakeStatistics } from "types";
import { validateMonthlyEarthquakeStatisticsRequest } from "./validator";
import { Dependencies } from "@infrastructure/dependencies";

export type GetMonthlyEarthquakeStatisticsQuery = {
  countryName: string;
  month: string;
};

export async function getMonthlyEarthquakeStatisticsQuery(
  query: GetMonthlyEarthquakeStatisticsQuery,
  dependencies: Dependencies,
): Promise<EarthquakeStatistics> {
  const { earthquakeRepository, logger } = dependencies;

  logger.info("Starting get monthly earthquake statistics query", { query });

  const validatedQuery =
    await validateMonthlyEarthquakeStatisticsRequest(query);

  const statistics =
    await earthquakeRepository.getHistoricalEarthquakeStatistics(
      validatedQuery.countryName,
      parseInt(validatedQuery.month, 10),
    );

  return {
    totalEarthquakes: statistics.totalEarthquakes,
    monthlyEarthquakePercentage: statistics.monthlyEarthquakePercentage,
    avgTsunamiCount: statistics.avgTsunamiCount,
    avgMagnitude: statistics.avgMagnitude,
  };
}
