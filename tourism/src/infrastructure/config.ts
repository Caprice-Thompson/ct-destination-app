import process from "node:process";
import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import { z } from "zod";

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
}

async function getSSMParameter(
  parameterName: string,
  decrypt = false,
): Promise<string> {
  const client = new SSMClient({});
  const command = new GetParameterCommand({
    Name: parameterName,
    WithDecryption: decrypt,
  });
  const response = await client.send(command);
  return response.Parameter?.Value || "";
}

export async function makeConfig(): Promise<ApplicationConfig> {
  const schema = z.object({
    DATABASE_URL: z.string().optional(),
    DB_HOST: z.string().optional(),
    DB_PORT: z.string().optional(),
    DB_NAME: z.string().optional(),
    DB_USERNAME_PARAM: z.string().optional(),
    DB_PASSWORD_PARAM: z.string().optional(),
    NODE_ENV: z.string().optional(),
    DB_QUERY_TIMEOUT: z.string().optional(),
    DB_CONNECTION_TIMEOUT: z.string().optional(),
    DB_USE_SSL: z.string().optional(),
  });

  const parsedEnv = schema.parse(process.env);

  const extendedSchema = schema.extend({
    DB_USER: z.string().optional(),
    DB_PASSWORD: z.string().optional(),
  });
  const extendedEnv = extendedSchema.parse(process.env);

  let connectionString: string;

  if (parsedEnv.DATABASE_URL) {
    connectionString = parsedEnv.DATABASE_URL;
  } else if (
    parsedEnv.DB_HOST &&
    parsedEnv.DB_USERNAME_PARAM &&
    parsedEnv.DB_PASSWORD_PARAM
  ) {
    const username = await getSSMParameter(parsedEnv.DB_USERNAME_PARAM);
    const password = await getSSMParameter(parsedEnv.DB_PASSWORD_PARAM, true);
    const host = parsedEnv.DB_HOST;
    const port = parsedEnv.DB_PORT || "5432";
    const dbName = parsedEnv.DB_NAME || "tourism";

    connectionString = `postgresql://${username}:${password}@${host}:${port}/${dbName}`;
  } else if (
    parsedEnv.DB_HOST &&
    extendedEnv.DB_USER &&
    extendedEnv.DB_PASSWORD
  ) {
    connectionString = `postgresql://${extendedEnv.DB_USER}:${extendedEnv.DB_PASSWORD}@${parsedEnv.DB_HOST}:${parsedEnv.DB_PORT || "5432"}/${parsedEnv.DB_NAME || "destination_db"}?schema=tourism`;
  } else {
    throw new Error(
      "Database configuration missing. Provide either DATABASE_URL or DB_HOST with SSM parameter paths.",
    );
  }

  return {
    database: {
      connectionString,
      queryTimeout: Number(parsedEnv.DB_QUERY_TIMEOUT) || 10000,
      connectionTimeout: Number(parsedEnv.DB_CONNECTION_TIMEOUT) || 30000,
      useSSL:
        parsedEnv.DB_USE_SSL === "true" || parsedEnv.NODE_ENV === "production",
    },
    service: {
      name: "tourism-service",
    },
  };
}
