import type { ApplicationConfig } from "./config";
import { makeConfig } from "./config";
import { makeLogger } from "./logger";
import type { Logger } from "@application/interfaces/logger";
import { CoordinatesRepository } from "./repositories/coordinates-repository";
import { EarthquakeRepository } from "./repositories/earthquake-repository";
import { DynamoDBEarthquakeRepository } from "./repositories/historical-earthquakes-repository";

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
  const earthquakeRepository = new EarthquakeRepository(
    config.urls.earthquakesApi,
    logger,
  );
  const coordinatesRepository = new CoordinatesRepository(
    config.urls.restCountriesApiUrl,
    logger,
  );
const historicalEarthquakeRepository = new DynamoDBEarthquakeRepository();

  return {
    config,
    logger,
    earthquakeRepository,
    coordinatesRepository,
    historicalEarthquakeRepository,
  };
}
