import type { GetTourismInformationQuery } from "@application/get-tourism-info/get-tourism-information";
import { getTourismInfo } from "@application/get-tourism-info/get-tourism-information";
import type { Dependencies } from "@infrastructure/dependencies";
import { type APIGatewayProxyEvent, createApiHandler } from "./wrappers";

export function getTourismInformationHandler(
  dependencies: Dependencies,
  event: APIGatewayProxyEvent,
) {
  const queryParams = {
    countryName: event.queryStringParameters?.countryName,
  } as GetTourismInformationQuery;

  return getTourismInfo(queryParams, dependencies);
}

export const handler = createApiHandler(getTourismInformationHandler, {
  successStatusCode: 200,
});
