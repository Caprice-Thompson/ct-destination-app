import process from "node:process";
import { z } from "zod";

export interface ApplicationConfig {
  database: {
    connectionString: string;
  };
  service: {
    name: string;
  };
  urls: {
    earthquakesApi: string;
  };
}

export async function makeConfig(): Promise<ApplicationConfig> {
  const schema = z.object({
    DATABASE_URL: z.string().default(""),
    EARTHQUAKES_SERVICE_URL: z
      .string()
      .default("http://localhost:3001/api/earthquakes/since"),
    SERVICE_NAME: z.string(),
  });

  const parsedEnv = schema.parse(process.env);

  return {
    database: {
      connectionString: parsedEnv.DATABASE_URL ?? "",
    },
    service: {
      name: parsedEnv.SERVICE_NAME,
    },
    urls: {
      earthquakesApi: parsedEnv.EARTHQUAKES_SERVICE_URL,
    },
  };
}
