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
    earthquakes: string;
  };
}

export async function makeConfig(): Promise<ApplicationConfig> {
  const schema = z.object({
    AWS_REGION: z.string(),
    AWS_ACCESS_KEY_ID: z.string().default(""),
    AWS_SECRET_ACCESS_KEY: z.string().default(""),
    AWS_SESSION_TOKEN: z.string().optional(),
    DATABASE_URL: z.string().default(""),
    DYNAMODB_EARTHQUAKES_TABLE: z.string().default(""),
    SERVICE_NAME: z.string(),
  });

  const parsedEnv = schema.parse(process.env);

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
      earthquakes: parsedEnv.DYNAMODB_EARTHQUAKES_TABLE,
    },
  };
}
