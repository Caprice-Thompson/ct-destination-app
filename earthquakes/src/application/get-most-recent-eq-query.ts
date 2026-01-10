import { Dependencies } from "@infrastructure/dependencies";
import { Earthquake } from "@domain/entities/earthquake";
import { validateMostRecentEqRequest } from "./validator";

export type GetMostRecentEarthquakesQuery = Readonly<{
  countryName: string;
  startTime: string;
  endTime: string;
  maxRadiusKm?: number;
  minMagnitude?: number;
  limit?: number;
}>;

export type EarthquakesResponse = {
  earthquakes: Earthquake[];
  countryName: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
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
export async function getMostRecentEarthquakesQuery(
  query: GetMostRecentEarthquakesQuery,
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

  const earthquakes = await earthquakeRepository.getMostRecentEarthquakes({
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    startTime: validatedQuery.startTime,
    endTime: validatedQuery.endTime,
    maxRadiusKm: validatedQuery.maxRadiusKm,
    minMagnitude: validatedQuery.minMagnitude,
    limit: validatedQuery.limit,
  });

  logger.info("Get most recent earthquakes query completed successfully", {
    countryName: validatedQuery.countryName,
    earthquakesCount: earthquakes.length,
  });

  return {
    earthquakes,
    countryName: validatedQuery.countryName,
    coordinates: {
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
    },
  };
}
