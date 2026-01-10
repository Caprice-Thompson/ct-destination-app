import { z, ZodError } from 'zod';
import { GetMostRecentEarthquakesQuery } from './get-most-recent-eq-query';

const getMostRecentEarthquakesSchema = z.object({
    countryName: z
        .string()
        .min(1, 'Country name is required')
        .max(100, 'Country name is too long')
        .regex(/^[a-zA-Z\s-]+$/, 'Country name must contain only letters, spaces, and hyphens'),
    startTime: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start time must be in YYYY-MM-DD format')
        .refine((date) => !isNaN(Date.parse(date)), 'Start time must be a valid date'),
    endTime: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'End time must be in YYYY-MM-DD format')
        .refine((date) => !isNaN(Date.parse(date)), 'End time must be a valid date'),
    maxRadiusKm: z
        .number()
        .min(0, 'Max radius must be positive')
        .max(20001.6, 'Max radius must not exceed 20001.6 km')
        .optional(),
    minMagnitude: z
        .number()
        .min(-1, 'Min magnitude must be at least -1')
        .max(10, 'Min magnitude must not exceed 10')
        .optional(),
    limit: z
        .number()
        .int('Limit must be an integer')
        .min(1, 'Limit must be at least 1')
        .max(20000, 'Limit must not exceed 20000')
        .optional(),
}).refine(
    (data) => new Date(data.startTime) < new Date(data.endTime),
    { message: 'Start time must be before end time', path: ['startTime'] }
);

export async function validateMostRecentEqRequest(query: unknown): Promise<GetMostRecentEarthquakesQuery> {
    try {
        return await getMostRecentEarthquakesSchema.parseAsync(query);
    } catch (error) {
        if (error instanceof ZodError) {
            const messages = error.issues.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
            throw new Error(`Validation error: ${messages}`);
        }
        throw new Error('Validation error: Invalid request');
    }
}

