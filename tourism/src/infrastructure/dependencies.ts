
import { makeConfig, type ApplicationConfig } from './config';
import { ToursimInformationRepositoryInterface } from '@application/interfaces/tourism-repo';
import { DbClient } from './rds';

export interface Dependencies {
    config: ApplicationConfig;
    rdsClient: DbClient;
    tourismInformationRepository: ToursimInformationRepositoryInterface;
}

export async function makeDependencies(): Promise<Dependencies> {
    const config = await makeConfig();
    const dbClient = await makeRdsClient(config);
    const tourismInformationRepository = makeTourismInformationRepository(dbClient);

    return {
        config,
        rdsClient: dbClient,
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

function makeTourismInformationRepository(dbClient: DbClient): ToursimInformationRepositoryInterface {
    return new TourismInformationRepository(dbClient);
}
