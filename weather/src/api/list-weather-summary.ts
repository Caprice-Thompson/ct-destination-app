import {
  type GetMonthlyWeatherSummaryQuery,
  getMonthlyWeatherSummary,
} from "@application/monthly-weather-summary/monthly-summary-query";
import type { Dependencies } from "@infrastructure/dependencies";
import { type APIGatewayProxyEvent, createApiHandler } from "./wrappers";

export function listWeatherSummaryHandler(
  dependencies: Dependencies,
  event: APIGatewayProxyEvent,
) {
  const queryParams = {
    countryName: event.queryStringParameters?.countryName,
    month: event.queryStringParameters?.month,
  } as GetMonthlyWeatherSummaryQuery;

  return getMonthlyWeatherSummary(queryParams, dependencies);
}

export const handler = createApiHandler(listWeatherSummaryHandler, {
  successStatusCode: 200,
});
