import type {
  CountryApiRepositoryInterface,
  CountryDatabaseRepositoryInterface,
  PopulationApiRepositoryInterface,
} from "@application/interfaces/repositories";
import { ListCountryInformation } from "@application/list-country-information";
import { type ApplicationConfig, makeConfig } from "./config";
import { CountryDatabaseBRepository } from "./repositories/country-database-repository";
import { type DbClient, rdsClient } from "./repositories/db/rds_client";
import { PopulationApiRepository } from "./repositories/population-api-repository";
import { RestCountriesApiRepository } from "./repositories/rest-countries-api-repository";

export interface Dependencies {
  config: ApplicationConfig;
  rdsClient: DbClient;
  countryApiRepository: CountryApiRepositoryInterface;
  populationApiRepository: PopulationApiRepositoryInterface;
  countryDataRepository: CountryDatabaseRepositoryInterface;
  listCountryInformationUseCase: ListCountryInformation;
}

export async function makeDependencies(): Promise<Dependencies> {
  const config = await makeConfig();
  const dbClient = await makeRdsClient(config);
  const countryApiRepository = makeCountryApiRepository(config);
  const populationApiRepository = makePopulationApiRepository(config);
  const countryDataRepository = makeCountryDataRepository(dbClient);
  const listCountryInformationUseCase = makeListCountryInformationUseCase(
    countryApiRepository,
    countryDataRepository,
    populationApiRepository,
  );

  return {
    config,
    rdsClient: dbClient,
    countryApiRepository,
    populationApiRepository,
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
    throw new Error(
      `Database connection failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

function makeCountryApiRepository(
  config: ApplicationConfig,
): CountryApiRepositoryInterface {
  return new RestCountriesApiRepository(config.api.restCountriesUrl);
}

function makePopulationApiRepository(
  config: ApplicationConfig,
): PopulationApiRepositoryInterface {
  return new PopulationApiRepository(config.api.populationApiUrl);
}

function makeCountryDataRepository(
  dbClient: DbClient,
): CountryDatabaseRepositoryInterface {
  return new CountryDatabaseBRepository(dbClient);
}

function makeListCountryInformationUseCase(
  countryApiRepository: CountryApiRepositoryInterface,
  countryDataRepository: CountryDatabaseRepositoryInterface,
  populationApiRepository: PopulationApiRepositoryInterface,
): ListCountryInformation {
  return new ListCountryInformation(
    countryApiRepository,
    countryDataRepository,
    populationApiRepository,
  );
}
