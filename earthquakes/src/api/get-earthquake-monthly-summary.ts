import {
  type GetMonthlyEarthquakeStatisticsQuery,
  getMonthlyEarthquakeStatisticsQuery,
} from "@application/monthly-statistics-query";
import { makeDependencies } from "@infrastructure/dependencies";
import type { APIGatewayEvent, APIGatewayProxyResult } from "../types";

/**
 * Lambda handler for calculating eq stats for a country
 *
 * Query Parameters:
 * - countryName: string (required) - Name of the country
 * - month: string (required)
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
          message: "Required parameters: countryName, month",
        }),
      };
    }

    const query: GetMonthlyEarthquakeStatisticsQuery = {
      countryName: params.countryName,
      month: params.month,
    };

    const result = await getMonthlyEarthquakeStatisticsQuery(
      query,
      dependencies,
    );

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

    if (errorMessage.includes("Validation error")) {
      logger.warn("Validation error in getMonthlyEarthquakeStatisticsHandler", {
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

    logger.error("Error in getMonthlyEarthquakeStatisticsHandler", {
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
