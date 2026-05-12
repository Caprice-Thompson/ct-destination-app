import {
  type GetMonthlyEarthquakeStatisticsQuery,
  getMonthlyEarthquakeStatisticsQuery,
} from "@application/monthly-statistics-query";
import { type Dependencies } from "@infrastructure/dependencies";
import { type APIGatewayProxyEvent, createApiHandler } from "./wrappers";

/**
 * Calculating eq stats for a given month for a country
 *
 * Query Parameters:
 * - countryName: string (required) - Name of the country
 * - month: string (required)
 */
export function getMonthlySummaryHandler(dependencies: Dependencies, event: APIGatewayProxyEvent) {

  const queryParams = {
    countryName: event.queryStringParameters?.countryName,
    month: event.queryStringParameters?.month,
  } as GetMonthlyEarthquakeStatisticsQuery;

  return getMonthlyEarthquakeStatisticsQuery(queryParams, dependencies);
}

export const handler = createApiHandler(getMonthlySummaryHandler, { successStatusCode: 200 });