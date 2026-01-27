import { Dependencies } from "@infrastructure/dependencies";
import { Earthquake } from "@domain/entities/earthquake";
import { validateMostRecentEqRequest } from "./validator";
import {
  formattedEndDate,
  formattedStartDate,
  limit,
  maxRadiusKm,
} from "./utils/constants";

export type GetMostRecentEarthquakesByCountryQuery = Readonly<{
  countryName: string;
}>;

export type EarthquakesResponse = {
  earthquakes: Earthquake[];
  countryName: string;
};

/**
 * Application use case: Get most recent earthquakes for a country
 *
 * Todo:
 * 1. Validate input parameters
 * 2. Get coordinates for the country name
 * 3. Query EQ API for earthquakes near those coordinates
 * 4. Return the results
 */
export async function getMostRecentEarthquakesByCountry(
  query: GetMostRecentEarthquakesByCountryQuery,
  dependencies: Dependencies,
): Promise<EarthquakesResponse> {
  const { earthquakeRepository, coordinatesRepository, logger } = dependencies;

  logger.info("Starting get most recent earthquakes query", { query });

  const validatedQuery = await validateMostRecentEqRequest(query);

  logger.debug("Fetching coordinates for country", {
    countryName: validatedQuery.countryName,
  });

  const coordinates = await coordinatesRepository.getCoordinatesByCountryName(
    validatedQuery.countryName,
  );

  logger.debug("Coordinates retrieved", {
    countryName: validatedQuery.countryName,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
  });

  const mostRecentEarthquakes =
    await earthquakeRepository.getMostRecentEarthquakesByCountry({
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      startTime: formattedStartDate,
      endTime: formattedEndDate,
      maxRadiusKm: maxRadiusKm,
      limit: limit,
    });

  logger.info("Get most recent earthquakes query completed successfully", {
    countryName: validatedQuery.countryName,
    earthquakesCount: mostRecentEarthquakes.length,
  });

  return {
    earthquakes: mostRecentEarthquakes,
    countryName: validatedQuery.countryName,
  };
}
