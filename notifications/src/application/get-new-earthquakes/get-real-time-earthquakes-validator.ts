import { ValidationException } from "@application/common/exceptions";
import { z } from "zod";

const requestSchema = z.object({
  userId: z.string().trim().min(1, "User ID is required"),
});

export type GetNewEarthquakesRequest = z.infer<typeof requestSchema>;

export async function validateGetNewEarthquakesRequest(
  request: GetNewEarthquakesRequest,
): Promise<GetNewEarthquakesRequest> {
  const result = requestSchema.safeParse(request);

  if (!result.success) {
    throw new ValidationException(result.error);
  }

  return result.data;
}
