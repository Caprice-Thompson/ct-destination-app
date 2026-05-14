import { ValidationException } from "@application/common/exceptions";
import { type ZodError, z } from "zod";
import type { GetTourismInformationQuery } from "./get-tourism-information";

export async function validateGetTourismInformationRequest(
  query: GetTourismInformationQuery,
) {
  try {
    const schema = z.object({
      countryName: z
        .string()
        .min(1, "Country name is required")
        .max(100, "Country name is too long")
        .regex(
          /^[\p{L}\s'-]+$/u,
          "Country name must contain only letters, spaces, hyphens, and apostrophes",
        ),
    });
    return await schema.parseAsync(query);
  } catch (error) {
    throw new ValidationException(error as ZodError);
  }
}
