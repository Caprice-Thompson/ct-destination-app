import type * as Interfaces from "@application/interfaces";
import type { DbClient } from "../../../shared/db/src/rds_client";
import { makeConfig } from "./config";
import { makeLogger } from "./logger";
import { makeRdsClient } from "./rds";
import { makeWeatherRepository } from "./repositories/weather-repository";
import { makeExternalWeatherAPIService } from "./services";

export type Dependencies = {
  logger: Interfaces.Logger;
  config: Interfaces.ApplicationConfig;
  rdsClient: DbClient;
  externalWeatherAPIService: Interfaces.ExternalWeatherAPIService;
  weatherRepository: Interfaces.WeatherRepository;
};

export async function makeDependencies(): Promise<Dependencies> {
  const config = await makeConfig();
  const logger = makeLogger();
  const rdsClient = await makeRdsClient(config);
  const externalWeatherAPIService = makeExternalWeatherAPIService({
    config,
    logger,
  });
  const weatherRepository = makeWeatherRepository({ config, logger });

  return {
    logger,
    config,
    rdsClient,
    externalWeatherAPIService,
    weatherRepository,
  };
}
