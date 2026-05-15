import type { GetTourismInformationQuery } from "@application/get-tourism-info/get-tourism-information";
import { ValidationException } from "@application/common/exceptions";
import { ZodError, z } from "zod";

const getTourismInformationSchema = z.object({
  countryName: z
    .string()
    .min(1, "Country name is required")
    .max(100, "Country name is too long")
    .regex(
      /^[\p{L}\s'-]+$/u,
      "Country name must contain only letters, spaces, hyphens, and apostrophes",
    ),
});

export async function validateGetTourismInformationRequest(
  query: GetTourismInformationQuery,
) {
  try {
    return await getTourismInformationSchema.parseAsync(query);
  } catch (error) {
    throw new ValidationException(error as ZodError);
  }
}
