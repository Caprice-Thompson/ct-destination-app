import { makeConfig, type ApplicationConfig } from './config';
import { TourismInformationRepositoryInterface } from '@application/interfaces/tourism-repo';
import { rdsClient, type DbClient } from './rds';
import { TourismDatabaseRepository } from './repositories/tourism-database-repository';
import { GetTourismInformation } from '@application/get-tourism-information';

export interface Dependencies {
  config: ApplicationConfig;
  rdsClient: DbClient;
  tourismInformationRepository: TourismInformationRepositoryInterface;
  getTourismInformationUseCase: GetTourismInformation;
}

export async function makeDependencies(): Promise<Dependencies> {
  const config = await makeConfig();
  const dbClient = await makeRdsClient(config);
  const tourismInformationRepository = makeTourismInformationRepository(dbClient);
  const getTourismInformationUseCase = makeGetTourismInformationUseCase(tourismInformationRepository);

  return {
    config,
    rdsClient: dbClient,
    tourismInformationRepository,
    getTourismInformationUseCase,
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

function makeTourismInformationRepository(dbClient: DbClient): TourismInformationRepositoryInterface {
  return new TourismDatabaseRepository(dbClient);
}

function makeGetTourismInformationUseCase(
  tourismInformationRepository: TourismInformationRepositoryInterface,
): GetTourismInformation {
  return new GetTourismInformation(tourismInformationRepository);
}
