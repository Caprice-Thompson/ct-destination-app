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

  const { countryName, month: targetMonth } =
    await validateMonthlyEarthquakeStatisticsRequest(query);

  const allEarthquakesByCountry =
    await earthquakeRepository.getEarthquakesByCountry(countryName);
  if (allEarthquakesByCountry.length === 0) {
    return {
      totalEarthquakes: 0,
      monthlyEarthquakePercentage: 0,
      avgTsunamiCount: 0,
      avgMagnitude: 0,
    };
  }
  const earthquakesInTargetMonth = allEarthquakesByCountry.filter((eq) => {
    const month = new Date(eq.date).getMonth() + 1;
    return month === parseInt(targetMonth, 10) && eq.type === "earthquake";
  });
  const totalEarthquakes = allEarthquakesByCountry.length;
  const totalInMonth = earthquakesInTargetMonth.length;
  const monthlyPercentage =
    totalEarthquakes > 0 ? (totalInMonth / totalEarthquakes) * 100 : 0;
  const avgTsunamiCount =
    totalInMonth > 0
      ? earthquakesInTargetMonth.filter((eq) => eq.tsunami > 0).length /
        totalInMonth
      : 0;
  const avgMagnitude =
    totalInMonth > 0
      ? earthquakesInTargetMonth.reduce((sum, eq) => sum + eq.magnitude, 0) /
        totalInMonth
      : 0;
  return {
    totalEarthquakes,
    monthlyEarthquakePercentage: monthlyPercentage,
    avgTsunamiCount,
    avgMagnitude,
  };
}
