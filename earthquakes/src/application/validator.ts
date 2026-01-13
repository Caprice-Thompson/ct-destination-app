import { z, ZodError } from "zod";
import { GetMostRecentEarthquakesQuery } from "./get-most-recent-eq-query";
import { GetMonthlyEarthquakeStatisticsQuery } from "./monthly-statistics-query";

export async function validateMostRecentEqRequest(
  query: GetMostRecentEarthquakesQuery,
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
        .regex(/^(0[1-9]|1[0-2])$/, "Month must be in MM format (01-12)"),
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
