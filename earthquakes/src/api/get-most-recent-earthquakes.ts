import {
  type GetLatestEarthquakesByCountryQuery,
  getMostRecentEarthquakesByCountry,
} from "@application/list-latest-earthquakes/list-latest-earthquakes-query";
import { type Dependencies } from "@infrastructure/dependencies";
import { APIGatewayProxyEvent, createApiHandler } from "./wrappers";

/**
 * Getting most recent earthquakes for a country
 *
 * Query Parameters:
 * - countryName: string (required) - Name of the country
 */
export function getLatestEarthquakesHandler(dependencies: Dependencies, event: APIGatewayProxyEvent) {
  const queryParams = {
    countryName: event.queryStringParameters?.countryName,
  } as GetLatestEarthquakesByCountryQuery;

  return getMostRecentEarthquakesByCountry(queryParams, dependencies);
}

export const handler = createApiHandler(getLatestEarthquakesHandler, { successStatusCode: 200 });