import process from "node:process";
import { z } from "zod";

export interface ApplicationConfig {
  aws: {
    accessKeyId: string;
    region: string;
    secretAccessKey: string;
    sessionToken?: string;
  };
  service: {
    name: string;
  };
  tables: {
    earthquakes: string;
  };
  urls: {
    earthquakesApi: string;
    restCountriesApiUrl: string;
  };
}

export async function makeConfig(): Promise<ApplicationConfig> {
  const schema = z.object({
    AWS_REGION: z.string(),
    AWS_ACCESS_KEY_ID: z.string(),
    AWS_SECRET_ACCESS_KEY: z.string(),
    AWS_SESSION_TOKEN: z.string().optional(),
    DYNAMODB_EARTHQUAKES_TABLE: z.string(),
    EARTHQUAKES_API_URL: z.string(),
    REST_COUNTRIES_API_URL: z.string(),
    SERVICE_NAME: z.string(),
  });

  const parsedEnv = schema.parse(process.env);

  return {
    aws: {
      accessKeyId: parsedEnv.AWS_ACCESS_KEY_ID,
      region: parsedEnv.AWS_REGION,
      secretAccessKey: parsedEnv.AWS_SECRET_ACCESS_KEY,
      sessionToken: parsedEnv.AWS_SESSION_TOKEN ?? '',
    },
    service: {
      name: parsedEnv.SERVICE_NAME,
    },
    tables: {
      earthquakes: parsedEnv.DYNAMODB_EARTHQUAKES_TABLE,
    },
    urls: {
      earthquakesApi: parsedEnv.EARTHQUAKES_API_URL,
      restCountriesApiUrl: parsedEnv.REST_COUNTRIES_API_URL,
    },
  };
}
