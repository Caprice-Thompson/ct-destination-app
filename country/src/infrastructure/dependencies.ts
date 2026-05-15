import type * as Interfaces from "@application/interfaces";
import { makeConfig } from "./config";
import { makeLogger } from "./logger";
import type { RdsClient } from "./rds";
import { makeRdsClient } from "./rds";
import { makeNationalDishRepository } from "./repositories/national-dish-repository";
import { makeCountryRestApiService } from "./services/country-rest-api-service";
import { makePopulationApiService } from "./services/population-api-service";

export type Dependencies = {
  logger: Interfaces.Logger;
  config: Interfaces.ApplicationConfig;
  rdsClient: RdsClient;
  countryApiRepository: Interfaces.CountryRestApiService;
  populationApiRepository: Interfaces.PopulationApiService;
  countryDataRepository: Interfaces.NationalDishRepository;
};

export async function makeDependencies(): Promise<Dependencies> {
  const config = await makeConfig();
  const logger = makeLogger();
  const rdsClient = await makeRdsClient(config);
  const countryApiRepository = makeCountryRestApiService({
    config,
    logger,
  });
  const populationApiRepository = makePopulationApiService({
    config,
    logger,
  });
  const countryDataRepository = makeNationalDishRepository({
    rdsClient,
    logger,
  });

  return {
    logger,
    config,
    rdsClient,
    countryApiRepository,
    populationApiRepository,
    countryDataRepository,
  };
}
