import type { Earthquake } from "@domain/entities/earthquake";
import type { Dependencies } from "@infrastructure/dependencies";
import { validateLatestEarthquakesRequest } from "./list-latest-earthquakes-query-validator";
import { formattedEndDate, formattedStartDate, limit, maxRadiusKm } from "@application/common/constants";

export type ListLatestEarthquakesByCountryQuery = Readonly<{
  countryName: string;
}>;

/**
 * Application use case: List latest earthquakes for a country
 */
export async function listLatestEarthquakesByCountry(
  query: ListLatestEarthquakesByCountryQuery,
  dependencies: Dependencies,
): Promise<Earthquake[]> {
  const { earthquakeRepository, coordinatesRepository, logger } = dependencies;

  logger.info("Starting list latest earthquakes query", { query });

  const { countryName } = await validateLatestEarthquakesRequest(query);

  logger.debug(`Fetching coordinates for country: ${countryName}`);

  const coordinates = await coordinatesRepository.getCoordinatesByCountryName(
    countryName,
  );

  logger.debug(`Coordinates retrieved for country: ${countryName}, latitude: ${coordinates.latitude}, longitude: ${coordinates.longitude}`);

  const latestEarthquakes =
    await earthquakeRepository.listLatestEarthquakesByCountry({
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      startTime: formattedStartDate,
      endTime: formattedEndDate,
      maxRadiusKm: maxRadiusKm,
      limit: limit,
    });

  logger.info(`List latest earthquakes query completed successfully for country: ${countryName}, earthquakes count: ${latestEarthquakes.length}`, {
    countryName,
    earthquakesCount: latestEarthquakes.length,
  });
  return latestEarthquakes;
}
