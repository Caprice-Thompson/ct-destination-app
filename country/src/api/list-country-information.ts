import {
  type ListCountryInformationQuery,
  listCountryInformationQuery,
} from "@application/list-country-information/list-country-information-query";
import type { Dependencies } from "@infrastructure/dependencies";
import { type APIGatewayProxyEvent, createApiHandler } from "./wrappers";

export function listCountryInformationHandler(
  dependencies: Dependencies,
  event: APIGatewayProxyEvent,
) {
  const queryParams = {
    countryName: event.queryStringParameters?.countryName ?? "",
  } as ListCountryInformationQuery;

  return listCountryInformationQuery(queryParams, dependencies);
}

export const handler = createApiHandler(listCountryInformationHandler, {
  successStatusCode: 200,
});
