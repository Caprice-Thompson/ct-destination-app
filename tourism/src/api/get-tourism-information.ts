<<<<<<< Updated upstream
import { validateGetTourismInformationRequest } from '@application/validator';
import { makeDependencies, type Dependencies } from '@infrastructure/dependencies';
import { logger } from '@infrastructure/logger';
import { APIGatewayEvent, APIGatewayProxyResult, ErrorResponse } from '../types';
=======
import { type APIGatewayProxyEvent, createApiHandler } from "./wrappers";
import { getTourismInfo } from "@application/get-tourism-info/get-tourism-information";
import type { Dependencies } from "@infrastructure/dependencies";
import { GetTourismInformationQuery } from "@application/get-tourism-info/get-tourism-information";
>>>>>>> Stashed changes

export function getTourismInformationHandler(dependencies: Dependencies, event: APIGatewayProxyEvent) {
  const queryParams = {
    countryName: event.queryStringParameters?.countryName,
  } as GetTourismInformationQuery;

  return getTourismInfo(queryParams, dependencies);
}

<<<<<<< Updated upstream
export const getTourismInformationHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {
    const query = await validateGetTourismInformationRequest(event.queryStringParameters);

    if (!dependencies) {
      dependencies = await makeDependencies();
    }

    const useCase = dependencies.getTourismInformationUseCase;

    const response = await useCase.getTourismInfo(query.countryName);

    logger.info('Successfully retrieved tourism information', {
      countryName: query.countryName,
      sitesCount: response.unescoSites.length,
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(response),
    };
  } catch (error) {
    logger.error('Error in getTourismInformationHandler', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    let statusCode = 500;

    if (errorMessage.includes('Validation error')) {
      statusCode = 400;
    } else if (errorMessage.includes('not found')) {
      statusCode = 404;
    }

    const errorResponse: ErrorResponse = {
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
    };

    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorResponse),
    };
  }
};
=======
export const handler = createApiHandler(getTourismInformationHandler, { successStatusCode: 200 });

>>>>>>> Stashed changes
