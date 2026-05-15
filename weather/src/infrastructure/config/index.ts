import process from "node:process";
import { z } from "zod";

export interface ApplicationConfig {
  aws: {
    accessKeyId: string;
    region: string;
    secretAccessKey: string;
    sessionToken?: string;
  };
  database: {
    connectionString: string;
  };
  service: {
    name: string;
  };
  tables: {
    weather: string;
  };
  urls: {
    externalWeatherAPI: string;
  };
}

export async function makeConfig(): Promise<ApplicationConfig> {
  const schema = z.object({
    AWS_REGION: z.string(),
    AWS_ACCESS_KEY_ID: z.string().default(""),
    AWS_SECRET_ACCESS_KEY: z.string().default(""),
    AWS_SESSION_TOKEN: z.string().optional(),
    DATABASE_URL: z.string().default(""),
    DYNAMODB_WEATHER_TABLE: z.string().default(""),
    EXTERNAL_WEATHER_API_URL: z.string().default(""),
    SERVICE_NAME: z.string(),
  });

  const parsedEnv = schema.parse(process.env);

  // const encodedPGPassword = encodeURIComponent(process.env.PGPASSWORD ?? "");
  // const connectionString = `postgresql://${process.env.PGUSER}:${encodedPGPassword}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;

  return {
    aws: {
      accessKeyId: parsedEnv.AWS_ACCESS_KEY_ID,
      region: parsedEnv.AWS_REGION,
      secretAccessKey: parsedEnv.AWS_SECRET_ACCESS_KEY,
      sessionToken: parsedEnv.AWS_SESSION_TOKEN ?? "",
    },
    database: {
      connectionString: parsedEnv.DATABASE_URL ?? "",
    },
    service: {
      name: parsedEnv.SERVICE_NAME,
    },
    tables: {
      weather: parsedEnv.DYNAMODB_WEATHER_TABLE,
    },
    urls: {
      externalWeatherAPI: parsedEnv.EXTERNAL_WEATHER_API_URL,
    },
  };
}
