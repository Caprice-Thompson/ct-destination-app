import { ListCountryInformation } from '@application/list-country-information';
import type {
  CountryApiRepositoryInterface,
  CountryDatabaseRepositoryInterface,
} from '@application/interfaces/repositories';
import { RestCountriesApiRepository } from './repositories/rest-countries-api-repository';
import { CountryDatabaseBRepository } from './repositories/country-database-repository';
import { rdsClient, type DbClient } from './repositories/db/rds_client';
import { makeConfig, type ApplicationConfig } from './config';

export interface Dependencies {
  config: ApplicationConfig;
  rdsClient: DbClient;
  countryApiRepository: CountryApiRepositoryInterface;
  countryDataRepository: CountryDatabaseRepositoryInterface;
  listCountryInformationUseCase: ListCountryInformation;
}

export async function makeDependencies(): Promise<Dependencies> {
  const config = await makeConfig();
  const dbClient = await makeRdsClient(config);
  const countryApiRepository = makeCountryApiRepository(config);
  const countryDataRepository = makeCountryDataRepository(dbClient);
  const listCountryInformationUseCase = makeListCountryInformationUseCase(countryApiRepository, countryDataRepository);

  return {
    config,
    rdsClient: dbClient,
    countryApiRepository,
    countryDataRepository,
    listCountryInformationUseCase,
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

function makeCountryApiRepository(config: ApplicationConfig): CountryApiRepositoryInterface {
  return new RestCountriesApiRepository(config.api.restCountriesUrl);
}

function makeCountryDataRepository(dbClient: DbClient): CountryDatabaseRepositoryInterface {
  return new CountryDatabaseBRepository(dbClient);
}

function makeListCountryInformationUseCase(
  countryApiRepository: CountryApiRepositoryInterface,
  countryDataRepository: CountryDatabaseRepositoryInterface,
): ListCountryInformation {
  return new ListCountryInformation(countryApiRepository, countryDataRepository);
}
