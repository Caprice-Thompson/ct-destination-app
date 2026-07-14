import {
  getEarthquakesSinceQuery,
  type GetEarthquakesSinceQuery,
} from "@application/get-earthquakes-since-last-date/get-earthquakes-since-query";
import type { Dependencies } from "@infrastructure/dependencies";
import { type APIGatewayProxyEvent, createApiHandler } from "./wrappers";

export function getEarthquakesSinceHandler(
  dependencies: Dependencies,
  event: APIGatewayProxyEvent,
) {
  const queryParams = {
    since: event.queryStringParameters?.since ?? "",
  } as GetEarthquakesSinceQuery;

  return getEarthquakesSinceQuery(queryParams, {
    earthquakeRepository: dependencies.earthquakeRepository,
    logger: dependencies.logger,
  });
}

export const handler = createApiHandler(getEarthquakesSinceHandler, {
  successStatusCode: 200,
});
