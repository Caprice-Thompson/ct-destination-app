import { validateCountryInformationRequest } from '@application/validator';
import { makeDependencies, type Dependencies } from '@infrastructure/dependencies';
import { logger } from '@infrastructure/logger';
import { APIGatewayEvent, APIGatewayProxyResult, CountryInformationResponse, ErrorResponse } from '../types';

let dependencies: Dependencies | null = null;

export const resetDependencies = () => {
  dependencies = null;
};

export const listCountryInformationHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {
    const query = await validateCountryInformationRequest(event.queryStringParameters);

    if (!dependencies) {
      dependencies = await makeDependencies();
    }

    const useCase = dependencies.listCountryInformationUseCase;

    const result = await useCase.executeUseCase(query.countryName);

    const response: CountryInformationResponse = {
      countryDetails: result.countryDetails!.toJSON(),
      capitalPopulation: result.capitalPopulation?.toJSON(),
      nationalDish: result.nationalDish?.toJSON(),
    };

    logger.info('Successfully retrieved country information', {
      countryName: query.countryName,
      hasPopulation: !!result.capitalPopulation,
      hasDish: !!result.nationalDish,
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(response),
    };
  } catch (error) {
    logger.error('Error in listCountryInformationHandler', {
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
