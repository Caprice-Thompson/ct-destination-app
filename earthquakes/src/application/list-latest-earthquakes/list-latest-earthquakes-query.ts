import {
  formattedEndDate,
  formattedStartDate,
  limit,
  maxRadiusKm,
  minMagnitude,
} from "@application/common/constants";
import type { Earthquake } from "@domain/entities/earthquake";
import type { Dependencies } from "@infrastructure/dependencies";
import { validateLatestEarthquakesRequest } from "./list-latest-earthquakes-query-validator";

export type ListLatestEarthquakesByCountryQuery = Readonly<{
  countryName: string;
}>;

/**
 * Application use case: List latest earthquakes for a given country
 */
export async function listLatestEarthquakesByCountry(
  query: ListLatestEarthquakesByCountryQuery,
  dependencies: Dependencies,
): Promise<{ earthquakes: Earthquake[]; countryName: string }> {
  const { usgsService, coordinatesRepository, logger } = dependencies;

  logger.info("Starting list latest earthquakes query", { query });

  const { countryName } = await validateLatestEarthquakesRequest(query);

  logger.debug(`Fetching coordinates for country: ${countryName}`);

  const coordinates =
    await coordinatesRepository.getCoordinatesByCountryName(countryName);

  logger.debug(
    `Coordinates retrieved for country: ${countryName}, latitude: ${coordinates.latitude}, longitude: ${coordinates.longitude}`,
  );

  const latestEarthquakes = await usgsService.listEarthquakes({
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    startTime: formattedStartDate,
    endTime: formattedEndDate,
    maxRadiusKm: maxRadiusKm,
    minMagnitude: minMagnitude,
    limit: limit,
  });

  logger.info(
    `List latest earthquakes query completed successfully for country: ${countryName}, earthquakes count: ${latestEarthquakes.length}`,
    {
      countryName,
      earthquakesCount: latestEarthquakes.length,
    },
  );
  return { earthquakes: latestEarthquakes, countryName };
}
