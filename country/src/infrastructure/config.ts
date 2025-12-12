import process from 'node:process';
import { z } from 'zod';

export interface ApplicationConfig {
  database: {
    connectionString: string;
    queryTimeout: number;
    connectionTimeout: number;
    useSSL: boolean;
  };
  service: {
    name: string;
  };
  api: {
    restCountriesUrl: string;
    populationApiUrl: string;
  };
  isTestEnv: boolean;
}

export async function makeConfig(): Promise<ApplicationConfig> {
  const schema = z.object({
    DATABASE_URL: z.string(),
    NODE_ENV: z.string().optional(),
    DB_QUERY_TIMEOUT: z.string().optional(),
    DB_CONNECTION_TIMEOUT: z.string().optional(),
    DB_USE_SSL: z.string().optional(),
    REST_COUNTRIES_API_URL: z.string().optional(),
    POPULATION_API_URL: z.string().optional(),
  });

  const parsedEnv = schema.parse(process.env);
  const isTestEnv = parsedEnv.NODE_ENV === 'test';

  return {
    database: {
      connectionString: parsedEnv.DATABASE_URL,
      queryTimeout: Number(parsedEnv.DB_QUERY_TIMEOUT) || 10000,
      connectionTimeout: Number(parsedEnv.DB_CONNECTION_TIMEOUT) || 30000,
      useSSL: parsedEnv.DB_USE_SSL === 'true' || parsedEnv.NODE_ENV === 'production',
    },
    service: {
      name: 'country-service',
    },
    api: {
      restCountriesUrl: parsedEnv.REST_COUNTRIES_API_URL ?? '',
      populationApiUrl: parsedEnv.POPULATION_API_URL ?? '',
    },
    isTestEnv,
  };
}
