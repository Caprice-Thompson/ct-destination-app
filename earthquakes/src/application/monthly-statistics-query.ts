import { Dependencies } from "@infrastructure/dependencies";
import { Earthquake } from "@domain/entities/earthquake";
import { validateMonthlyEarthquakeStatisticsRequest } from "./validator";
import {
  formattedEndDate,
  formattedStartDate,
  limit,
  maxRadiusKm,
} from "./utils/constants";

export type GetMonthlyEarthquakeStatisticsQuery = Readonly<{
  countryName: string;
  month: string;
}>;

export type EarthquakesResponse = {
  earthquakes: Earthquake[];
  countryName: string;
};

/**
 * Application use case: Get monthly earthquake statistics for a country
 *
 * Todo:
 * 1. Validate input parameters
 * 2. Get coordinates for the country name
 * 3. Query EQ API for earthquakes near those coordinates
 * 4. Return the results
 */
export async function getMonthlyEarthquakeStatisticsQuery(
  query: GetMonthlyEarthquakeStatisticsQuery,
  dependencies: Dependencies,
): Promise<EarthquakesResponse> {
  const { earthquakeRepository, coordinatesRepository, logger } = dependencies;

  logger.info("Starting validation for monthly earthquake statistics query", {
    query,
  });

  const validatedQuery =
    await validateMonthlyEarthquakeStatisticsRequest(query);

  // get Eq data for the month
  // calc stats
  const getHistoricalEarthquakeData =
    earthquakeRepository.getHistoricalEarthquakeData();
  const statsForMonth = earthquakeRepository.calculateMonthlyStatistics(
    getHistoricalEarthquakeData,
    validatedQuery.month,
  );

  return {
    earthquakes: statsForMonth,
    countryName: validatedQuery.countryName,
  };
}
