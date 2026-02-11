import type { Logger } from "@application/interfaces/logger";
import type { ApplicationConfig } from "./config";
import { makeConfig } from "./config";
import { makeLogger } from "./logger";
import { CoordinatesRepository } from "./repositories/coordinates-repository";
import { DynamoDBEarthquakeRepository } from "./repositories/dynamodb-eq-repository";
import { EarthquakeRepository } from "./repositories/earthquake-repository";

export type Dependencies = {
  config: ApplicationConfig;
  logger: Logger;
  earthquakeRepository: EarthquakeRepository;
  coordinatesRepository: CoordinatesRepository;
  historicalEarthquakeRepository: DynamoDBEarthquakeRepository;
};

export async function makeDependencies(): Promise<Dependencies> {
  const config = await makeConfig();
  const logger = makeLogger(config);
  const historicalEarthquakeRepository = new DynamoDBEarthquakeRepository({
    config,
    logger,
  });
  const earthquakeRepository = new EarthquakeRepository({
    config,
    logger,
    historicalEarthquakeRepository,
  });
  const coordinatesRepository = new CoordinatesRepository({ config, logger });

  return {
    config,
    logger,
    earthquakeRepository,
    coordinatesRepository,
    historicalEarthquakeRepository,
  };
}
