
import type * as Interfaces from "@application/interfaces";

import { makeConfig } from "./config";
import { makeLogger } from "./logger";
import { CoordinatesRepository } from "./repositories/coordinates-repository";
import { EarthquakeRepository, makeEarthquakeRepository } from "./repositories/earthquake-repository";

export type Dependencies = {
  logger: Interfaces.Logger;
  config: Interfaces.ApplicationConfig;
  earthquakeRepository: Interfaces.EarthquakeRepository;
  coordinatesRepository: Interfaces.CoordinatesRepository;
};

export async function makeDependencies(): Promise<Dependencies> {
  const config = await makeConfig();
  const logger = makeLogger({});
  const earthquakeRepository = makeEarthquakeRepository({ logger, config });
  const coordinatesRepository = new CoordinatesRepository({ logger });

  return {
    logger,
    earthquakeRepository,
    coordinatesRepository,
  };
}
