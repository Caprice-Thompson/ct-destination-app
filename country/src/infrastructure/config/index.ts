import process from "node:process";
import type { ApplicationConfig } from "@application/interfaces/config";
import { z } from "zod";

export async function makeConfig(): Promise<ApplicationConfig> {
  const schema = z.object({
    DATABASE_URL: z.string().optional(),
    DB_HOST: z.string().optional(),
    DB_PORT: z.string().optional(),
    DB_NAME: z.string().optional(),
    DB_USERNAME_PARAM: z.string().optional(),
    DB_PASSWORD_PARAM: z.string().optional(),
    DB_QUERY_TIMEOUT: z.string().optional(),
    DB_CONNECTION_TIMEOUT: z.string().optional(),
    DB_USE_SSL: z.string().optional(),
    REST_COUNTRIES_API_URL: z.string().optional(),
    REST_COUNTRIES_AUTHORIZATION: z.string().optional(),
    POPULATION_API_URL: z.string().optional(),
    SERVICE_NAME: z.string().optional(),
  });

  const parsedEnv = schema.parse(process.env);

  return {
    database: {
      connectionString: parsedEnv.DATABASE_URL ?? "",
    },
    service: {
      name: parsedEnv.SERVICE_NAME ?? "",
    },
    api: {
      restCountriesUrl: parsedEnv.REST_COUNTRIES_API_URL ?? "",
      restCountriesAuthorization: parsedEnv.REST_COUNTRIES_AUTHORIZATION ?? "",
      populationApiUrl: parsedEnv.POPULATION_API_URL ?? "",
    },
  };
}
