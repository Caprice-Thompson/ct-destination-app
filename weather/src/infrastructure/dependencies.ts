import type * as Interfaces from "@application/interfaces";
import { makeConfig } from "./config";
import { makeLogger } from "./logger";
import { makeWeatherRepository } from "./repositories/weather-repository";

export type Dependencies = {
  logger: Interfaces.Logger;
  config: Interfaces.ApplicationConfig;
  weatherRepository: Interfaces.WeatherRepository;
};

export async function makeDependencies(): Promise<Dependencies> {
  const config = await makeConfig();
  const logger = makeLogger();

  const weatherRepository = makeWeatherRepository({ config, logger });

  return {
    logger,
    config,
    weatherRepository,
  };
}
