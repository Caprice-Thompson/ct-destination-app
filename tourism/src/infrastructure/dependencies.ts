import type { TourismInformationRepositoryInterface } from '@application/interfaces/tourism-repo';
import { type ApplicationConfig, makeConfig } from './config';
import { type DbClient, rdsClient } from './rds';
import { makeLogger } from './logger';
import type * as Interfaces from '@application/interfaces';
import { makeTourismInformationRepository } from './repositories/tourism-database-repository';

export interface Dependencies {
  config: ApplicationConfig;
  rdsClient: DbClient;
  tourismInformationRepository: TourismInformationRepositoryInterface;
  logger: Interfaces.Logger;
}

export async function makeDependencies(): Promise<Dependencies> {
  const config = await makeConfig();
  const logger = makeLogger({});
  const rdsClient = await makeRdsClient(config);
  const tourismInformationRepository = await makeTourismInformationRepository({ rdsClient });

  return {
    config,
    logger,
    rdsClient,
    tourismInformationRepository,
  };
}

async function makeRdsClient(config: ApplicationConfig): Promise<DbClient> {
  try {
    return await rdsClient({
      applicationName: config.service.name,
      connectionString: config.database.connectionString,
      queryTimeout: config.database.queryTimeout,
      connectionTimeout: config.database.connectionTimeout,
      useSSl: config.database.useSSL,
    });
  } catch (error) {
    throw new Error(`Database connection failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
