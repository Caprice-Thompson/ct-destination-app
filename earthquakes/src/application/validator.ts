import { z, ZodError } from "zod";
import { getMostRecentEarthquakesByCountryQuery } from "./get-most-recent-eq-query";
import { GetMonthlyEarthquakeStatisticsQuery } from "./monthly-statistics-query";

export async function validateMostRecentEqRequest(
  query: getMostRecentEarthquakesByCountryQuery,
) {
  try {
    const schema = z.object({
      countryName: z
        .string()
        .min(1, "Country name is required")
        .regex(
          /^[a-zA-Z\s-]+$/,
          "Country name must contain only letters, spaces, and hyphens",
        ),
    });
    return await schema.parseAsync(query);
  } catch (error) {
    if (error instanceof ZodError) {
      const messages = error.issues
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");
      throw new Error(`Validation error: ${messages}`);
    }
    throw new Error("Validation error: Invalid request");
  }
}

export async function validateMonthlyEarthquakeStatisticsRequest(
  query: GetMonthlyEarthquakeStatisticsQuery,
) {
  try {
    const schema = z.object({
      countryName: z
        .string()
        .min(1, "Country name is required")
        .regex(
          /^[a-zA-Z\s-]+$/,
          "Country name must contain only letters, spaces, and hyphens",
        ),
      month: z
        .string()
        .min(1, "Month is required")
        .regex(/^([1-9]|1[0-2])$/, "Month must be in MM format (1-12)")
        .regex(/^([1-12])$/, "Month must be a number between 1 and 12"),
    });
    return await schema.parseAsync(query);
  } catch (error) {
    if (error instanceof ZodError) {
      const messages = error.issues
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");
      throw new Error(`Validation error: ${messages}`);
    }
    throw new Error("Validation error: Invalid request");
  }
}
