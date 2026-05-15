import type * as Interfaces from "@application/interfaces";
import type { DbClient } from "../../../shared/db/src/rds_client";
import { makeConfig } from "./config";
import { makeLogger } from "./logger";
import { makeRdsClient } from "./rds";
import { makeCoordinatesRepository } from "./services/coordinates-service";
import { makeEarthquakeRepository } from "./repositories/eq-repo";
import { makeUsgsService } from "./services/usgs-service";

export type Dependencies = {
  logger: Interfaces.Logger;
  config: Interfaces.ApplicationConfig;
  rdsClient: DbClient;
  usgsService: Interfaces.UsgsService;
  earthquakeRepository: Interfaces.EarthquakeRepository;
  coordinatesRepository: Interfaces.CoordinatesRepository;
};

export async function makeDependencies(): Promise<Dependencies> {
  const config = await makeConfig();
  const logger = makeLogger();
  const rdsClient = await makeRdsClient(config);
  const usgsService = makeUsgsService({ config, logger });
  const earthquakeRepository = makeEarthquakeRepository({ config, logger });
  const coordinatesRepository = makeCoordinatesRepository({ config, logger });

  return {
    logger,
    config,
    rdsClient,
    usgsService,
    earthquakeRepository,
    coordinatesRepository,
  };
}
