import type { GetTourismInformationQuery } from '@application/get-tourism-info/get-tourism-information';
import { z, ZodError } from 'zod';

const getTourismInformationSchema = z.object({
  countryName: z
    .string()
    .min(1, 'Country name is required')
    .max(100, 'Country name is too long')
    .regex(/^[\p{L}\s'-]+$/u, 'Country name must contain only letters, spaces, hyphens, and apostrophes'),
});

export async function validateGetTourismInformationRequest(query: unknown): Promise<GetTourismInformationQuery> {
  try {
    return await getTourismInformationSchema.parseAsync(query);
  } catch (error) {
    if (error instanceof ZodError) {
      const messages = error.issues.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
      throw new Error(`Validation error: ${messages}`);
    }
    throw new Error('Validation error: Invalid request');
  }
}
