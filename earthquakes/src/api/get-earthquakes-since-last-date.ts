import {
  getEarthquakesSinceDateQuery,
  type GetEarthquakesSinceDateQuery,
} from "@application/get-earthquakes-since-last-date/get-earthquakes-since-query";
import type { Dependencies } from "@infrastructure/dependencies";
import { type APIGatewayProxyEvent, createApiHandler } from "./wrappers";

export function getEarthquakesSinceDateHandler(
  dependencies: Dependencies,
  event: APIGatewayProxyEvent,
) {
  const queryParams = {
    since: event.queryStringParameters?.since ?? "",
  } as GetEarthquakesSinceDateQuery;

  return getEarthquakesSinceDateQuery(queryParams, {
    earthquakeRepository: dependencies.earthquakeRepository,
    logger: dependencies.logger,
  });
}

export const handler = createApiHandler(getEarthquakesSinceDateHandler, {
  successStatusCode: 200,
});
