import type * as Interfaces from "@application/interfaces";
import { makeConfig } from "./config";
import { makeLogger } from "./logger";
import { makeEarthquakeRepository } from "./repositories/eq-repo";
import { makeCoordinatesRepository } from "./services/coordinates-service";
import { makeUsgsService } from "./services/usgs-service";

export type Dependencies = {
  logger: Interfaces.Logger;
  config: Interfaces.ApplicationConfig;
  usgsService: Interfaces.UsgsService;
  earthquakeRepository: Interfaces.EarthquakeRepository;
  coordinatesRepository: Interfaces.CoordinatesRepository;
};

export async function makeDependencies(): Promise<Dependencies> {
  const config = await makeConfig();
  const logger = makeLogger();
  const usgsService = makeUsgsService({ config, logger });
  const earthquakeRepository = makeEarthquakeRepository({ config, logger });
  const coordinatesRepository = makeCoordinatesRepository({ config, logger });

  return {
    logger,
    config,
    usgsService,
    earthquakeRepository,
    coordinatesRepository,
  };
}
