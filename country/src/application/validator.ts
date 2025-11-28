import { z, ZodError } from 'zod';
import { ListCountryInformationQuery } from '../types';

const listCountryInformationSchema = z.object({
  countryName: z
    .string()
    .min(1, 'Country name is required')
    .max(100, 'Country name is too long')
    .regex(/^[a-zA-Z\s-]+$/, 'Country name must contain only letters, spaces, and hyphens'),
});

export async function validateCountryInformationRequest(query: unknown): Promise<ListCountryInformationQuery> {
  try {
    return await listCountryInformationSchema.parseAsync(query);
  } catch (error) {
    if (error instanceof ZodError) {
      const messages = error.issues.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
      throw new Error(`Validation error: ${messages}`);
    }
    throw new Error('Validation error: Invalid request');
  }
}
