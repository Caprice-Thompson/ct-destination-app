import {
  type ListLatestEarthquakesByCountryQuery,
  listLatestEarthquakesByCountry,
} from "@application/list-latest-earthquakes/list-latest-earthquakes-query";
import type { Dependencies } from "@infrastructure/dependencies";
import { type APIGatewayProxyEvent, createApiHandler } from "./wrappers";

export function getLatestEarthquakesHandler(
  dependencies: Dependencies,
  event: APIGatewayProxyEvent,
) {
  const queryParams = {
    countryName: event.queryStringParameters?.countryName ?? "",
  } as ListLatestEarthquakesByCountryQuery;

  return listLatestEarthquakesByCountry(queryParams, dependencies);
}

export const handler = createApiHandler(getLatestEarthquakesHandler, {
  successStatusCode: 200,
});
