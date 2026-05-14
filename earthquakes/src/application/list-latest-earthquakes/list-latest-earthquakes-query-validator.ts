import { ValidationException } from "@application/common/exceptions";
import { type ZodError, z } from "zod";
import type { ListLatestEarthquakesByCountryQuery } from "./list-latest-earthquakes-query";

export async function validateLatestEarthquakesRequest(
  query: ListLatestEarthquakesByCountryQuery,
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
    throw new ValidationException(error as ZodError);
  }
}
