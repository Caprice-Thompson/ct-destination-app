import type { EarthquakeRepository } from "@application/interfaces/repositories";
import type { Logger } from "@application/interfaces/logger";
import type { Earthquake } from "@domain/entities/earthquake";
import { validateGetEarthquakesSinceRequest } from "./get-earthquakes-since-validator";

export type GetEarthquakesSinceQuery = Readonly<{
  since: string;
}>;

export type GetEarthquakesSinceDependencies = Readonly<{
  earthquakeRepository: EarthquakeRepository;
  logger: Logger;
}>;

export async function getEarthquakesSinceQuery(
  query: GetEarthquakesSinceQuery,
  dependencies: GetEarthquakesSinceDependencies,
): Promise<{ earthquakes: Earthquake[] }> {
  const { earthquakeRepository, logger } = dependencies;

  logger.info("Starting get earthquakes since query", { since: query.since });

  const { since } = await validateGetEarthquakesSinceRequest(query);
  const timestamp = new Date(since);

  const earthquakes = await earthquakeRepository.findSince(timestamp);

  logger.info("Get earthquakes since query completed", {
    since,
    earthquakesCount: earthquakes.length,
  });

  return { earthquakes };
}
