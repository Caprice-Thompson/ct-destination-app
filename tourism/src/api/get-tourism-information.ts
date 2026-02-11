import { validateGetTourismInformationRequest } from "@application/validator";
import {
  type Dependencies,
  makeDependencies,
} from "@infrastructure/dependencies";
import { logger } from "@infrastructure/logger";
import type {
  APIGatewayEvent,
  APIGatewayProxyResult,
  ErrorResponse,
} from "../types";

let dependencies: Dependencies | null = null;

export const resetDependencies = () => {
  dependencies = null;
};

export const getTourismInformationHandler = async (
  event: APIGatewayEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const query = await validateGetTourismInformationRequest(
      event.queryStringParameters,
    );

    if (!dependencies) {
      dependencies = await makeDependencies();
    }

    const useCase = dependencies.getTourismInformationUseCase;

    const response = await useCase.getTourismInfo(query.countryName);

    logger.info("Successfully retrieved tourism information", {
      countryName: query.countryName,
      sitesCount: response.unescoSites.length,
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(response),
    };
  } catch (error) {
    logger.error("Error in getTourismInformationHandler", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    let statusCode = 500;

    if (errorMessage.includes("Validation error")) {
      statusCode = 400;
    } else if (errorMessage.includes("not found")) {
      statusCode = 404;
    }

    const errorResponse: ErrorResponse = {
      message: errorMessage,
      details:
        process.env.NODE_ENV === "development" && error instanceof Error
          ? error.stack
          : undefined,
    };

    return {
      statusCode,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(errorResponse),
    };
  }
};
