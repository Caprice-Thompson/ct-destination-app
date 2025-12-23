import { GetTourismInformationQuery } from 'src/types';
import { z, ZodError } from 'zod';

const getTourismInformationSchema = z.object({
  countryName: z
    .string()
    .min(1, 'Country name is required')
    .max(100, 'Country name is too long')
    .regex(/^[a-zA-Z\s-]+$/, 'Country name must contain only letters, spaces, and hyphens'),
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
