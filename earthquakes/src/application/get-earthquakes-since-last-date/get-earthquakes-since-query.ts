import type { Earthquake } from "@domain/entities/earthquake";
import { validateGetEarthquakesSinceRequest } from "./get-earthquakes-since-validator";
import { Dependencies } from "@infrastructure/dependencies";

export type GetEarthquakesSinceDateQuery = Readonly<{
  since: string;
}>;

export async function getEarthquakesSinceDateQuery(
  query: GetEarthquakesSinceDateQuery,
  dependencies: Pick<Dependencies, "earthquakeRepository" | "logger">,
): Promise<{ earthquakes: Earthquake[] }> {
  const { earthquakeRepository, logger } = dependencies;

  logger.info("Starting get earthquakes since last date query", {
    since: query.since,
  });

  const { since } = await validateGetEarthquakesSinceRequest(query);
  const timestamp = new Date(since);

  const earthquakes = await earthquakeRepository.findSince(timestamp);

  logger.info("Get earthquakes since last date query completed", {
    since,
    earthquakesCount: earthquakes.length,
  });

  return { earthquakes };
}
