import type * as Interfaces from "@application/interfaces/earthquake-repo";
import { makeConfig } from "./config";
import { makeLogger } from "./logger";

export type Dependencies = {
  config: Interfaces.ApplicationConfig;
  logger: Interfaces.Logger;
  earthquakeRepository: Interfaces.EarthquakeRepository;
};

export async function makeDependencies(): Promise<Dependencies> {
  const config = await makeConfig();
  const logger = makeLogger(config);
  const earthquakeRepository = makeEarthquakeRepository({ config });


  return {
    config,
    logger,
    earthquakeRepository,
  };
}
