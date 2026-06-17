import type * as Interfaces from "@application/interfaces";
import type { DbClient } from "../../../shared/db/src/rds_client";
import { makeConfig } from "./config";
import { makeLogger } from "./logger";
import { makeRdsClient } from "./rds";
import { makeEarthquakeEventsRepository } from "./repositories/earthquake-events-repository";
import { makeUserRepository } from "./repositories/user-repository";

export type Dependencies = {
  logger: Interfaces.Logger;
  config: Interfaces.ApplicationConfig;
  rdsClient: DbClient;
  earthquakeEventsRepository: Interfaces.EarthquakeEventsRepository;
  userRepository: Interfaces.UserRepository;
};

export async function makeDependencies(): Promise<Dependencies> {
  const config = await makeConfig();
  const logger = makeLogger();
  const rdsClient = await makeRdsClient(config);
  const earthquakeEventsRepository = makeEarthquakeEventsRepository({ config });
  const userRepository = makeUserRepository({ logger, rdsClient });

  return {
    logger,
    config,
    rdsClient,
    earthquakeEventsRepository,
    userRepository,
  };
}
