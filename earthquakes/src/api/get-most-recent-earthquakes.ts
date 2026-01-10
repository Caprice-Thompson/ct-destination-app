import {
  getMostRecentEarthquakesQuery,
  type GetMostRecentEarthquakesQuery,
} from "@application/get-most-recent-eq-query";
import { makeDependencies } from "@infrastructure/dependencies";
import { APIGatewayEvent, APIGatewayProxyResult } from "../types";

/**
 * Lambda handler for getting most recent earthquakes for a country
 *
 * Query Parameters:
 * - countryName: string (required) - Name of the country
 * - startTime: string (required) - Start date in ISO format (YYYY-MM-DD)
 * - endTime: string (required) - End date in ISO format (YYYY-MM-DD)
 * - maxRadiusKm: number (optional) - Maximum radius in kilometers (default: 300)
 * - minMagnitude: number (optional) - Minimum earthquake magnitude
 * - limit: number (optional) - Maximum number of results
 */
export const handler = async (
  event: APIGatewayEvent,
): Promise<APIGatewayProxyResult> => {
  const dependencies = await makeDependencies();
  const { logger } = dependencies;

  try {
    const params = event.queryStringParameters;

    if (!params) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "Missing query parameters",
          message: "Required parameters: countryName, startTime, endTime",
        }),
      };
    }

    const query: GetMostRecentEarthquakesQuery = {
      countryName: params.countryName || "",
      startTime: params.startTime || "",
      endTime: params.endTime || "",
      maxRadiusKm: params.maxRadiusKm
        ? parseFloat(params.maxRadiusKm)
        : undefined,
      minMagnitude: params.minMagnitude
        ? parseFloat(params.minMagnitude)
        : undefined,
      limit: params.limit ? parseInt(params.limit, 10) : undefined,
    };

    const result = await getMostRecentEarthquakesQuery(query, dependencies);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(result),
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const isValidationError =
      errorMessage.includes("required") ||
      errorMessage.includes("must be") ||
      errorMessage.includes("Valid");

    if (isValidationError) {
      logger.warn("Validation error in getMostRecentEarthquakesHandler", {
        error: errorMessage,
      });

      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "Validation error",
          message: errorMessage,
        }),
      };
    }

    logger.error("Error in getMostRecentEarthquakesHandler", {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });

    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Internal server error",
        message: "Failed to fetch earthquake data",
      }),
    };
  }
};
