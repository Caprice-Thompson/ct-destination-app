import { ListCountryInformationUseCase } from '@application/list-country-information';
import type { CountryApiRepository, CountryDataRepository } from '@application/interfaces/repositories';
import { RestCountriesApiRepository } from './repositories/rest-countries-api-repository';
import { CountryDBRepository } from './repositories/country-repository';
import { rdsClient, type DbClient } from './repositories/db/rds_client';
import { makeConfig, type ApplicationConfig } from './config';

export interface Dependencies {
  config: ApplicationConfig;
  rdsClient: DbClient;
  countryApiRepository: CountryApiRepository;
  countryDataRepository: CountryDataRepository;
  listCountryInformationUseCase: ListCountryInformationUseCase;
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

function makeCountryApiRepository(config: ApplicationConfig): CountryApiRepository {
  return new RestCountriesApiRepository(config.api.restCountriesUrl);
}

function makeCountryDataRepository(dbClient: DbClient): CountryDataRepository {
  return new CountryDBRepository(dbClient);
}

function makeListCountryInformationUseCase(
  countryApiRepository: CountryApiRepository,
  countryDataRepository: CountryDataRepository,
): ListCountryInformationUseCase {
  return new ListCountryInformationUseCase(countryApiRepository, countryDataRepository);
}
