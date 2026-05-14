import { type Dependencies } from '@infrastructure/dependencies';
import { ListCountryInformationQuery } from '../types';
import { createApiHandler } from './wrappers/api-handler';


export function listCountryInformationHandler(dependencies: Dependencies, event: APIGatewayProxyEvent) {
  const queryParams = {
    ...event.queryStringParameters,
  } as ListCountryInformationQuery;

  return listCountryInformationQuery(queryParams, dependencies);
}

export const handler = createApiHandler(listCountryInformationHandler, { successStatusCode: 200 });