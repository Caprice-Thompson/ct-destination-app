import { ValidationException } from "@application/common/exceptions";
import { type ZodError, z } from "zod";
import type { GetMonthlyWeatherSummaryQuery } from "./monthly-summary-query";

export async function validateMonthlyWeatherSummaryRequest(
  query: GetMonthlyWeatherSummaryQuery,
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
