import { ValidationException } from "@application/common/exceptions";
import { type ZodError, z } from "zod";
import type { MonthlyEarthquakeStatisticsQuery } from "./monthly-statistics-query";

export async function validateMonthlyEarthquakeStatisticsRequest(
  query: MonthlyEarthquakeStatisticsQuery,
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
        .regex(/^(?:[1-9]|1[0-2])$/, "Month must be a number between 1 and 12"),
    });
    return await schema.parseAsync(query);
  } catch (error) {
    throw new ValidationException(error as ZodError);
  }
}
