import { ValidationException } from "@application/common/exceptions";
import { z } from "zod";

const requestSchema = z.object({
  since: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid ISO 8601 timestamp",
  }),
});

export type GetEarthquakesSinceRequest = z.infer<typeof requestSchema>;

export async function validateGetEarthquakesSinceRequest(
  request: GetEarthquakesSinceRequest,
): Promise<GetEarthquakesSinceRequest> {
  const result = requestSchema.safeParse(request);

  if (!result.success) {
    throw new ValidationException(result.error);
  }

  return result.data;
}
