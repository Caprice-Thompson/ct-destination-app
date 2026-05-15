import type * as Interfaces from "@application/interfaces";
import type { TourismInformationRepositoryInterface } from "@application/interfaces/tourism-repo";
import { type ApplicationConfig, makeConfig } from "./config";
import { makeLogger } from "./logger";
import { makeRdsClient, type RdsClient } from "./rds";
import { makeTourismInformationRepository } from "./repositories/tourism-database-repository";

export interface Dependencies {
  config: ApplicationConfig;
  rdsClient: RdsClient;
  tourismInformationRepository: TourismInformationRepositoryInterface;
  logger: Interfaces.Logger;
}

export async function makeDependencies(): Promise<Dependencies> {
  const config = await makeConfig();
  const logger = makeLogger();
  const rdsClient = await makeRdsClient(config);
  const tourismInformationRepository = await makeTourismInformationRepository({
    rdsClient,
  });

  return {
    config,
    logger,
    rdsClient,
    tourismInformationRepository,
  };
}
