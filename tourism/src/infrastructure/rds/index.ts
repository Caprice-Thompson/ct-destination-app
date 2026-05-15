import { rdsClient } from "../../../../shared/db/src/rds_client";
import type { ApplicationConfig } from "../config";

export async function makeRdsClient(config: ApplicationConfig) {
  try {
    return await rdsClient({
      applicationName: config.service.name,
      connectionString: config.database.connectionString,
      useSSl: false,
    });
  } catch (error) {
    throw new Error(
      `Database connection failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export type { DbClient as RdsClient } from "../../../../shared/db/src/rds_client";
