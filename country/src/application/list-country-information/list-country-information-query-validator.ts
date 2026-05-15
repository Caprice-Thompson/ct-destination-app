import { ValidationException } from "@application/common/exceptions";
import { type ZodError, z } from "zod";
import type { ListCountryInformationQuery } from "./list-country-information-query";

export async function validateCountryInformationRequest(
  query: ListCountryInformationQuery,
) {
  try {
    const schema = z.object({
      countryName: z
        .string()
        .min(1, "Country name is required")
        .max(100, "Country name is too long")
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
