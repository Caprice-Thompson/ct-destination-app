import type { Dependencies } from "@infrastructure/dependencies";

const EUROPE_CENTER_LATITUDE = 50;
const EUROPE_CENTER_LONGITUDE = 15;
const EUROPE_MAX_RADIUS_KM = 4500;

type IngestParams = {
  startTime: string;
  endTime: string;
};

type IngestResult = {
  totalFetched: number;
  successfullyWritten: number;
};

export async function ingestEarthquakes(
  dependencies: Dependencies,
  { startTime, endTime }: IngestParams,
): Promise<IngestResult> {
  const { logger, usgsService, earthquakeRepository } = dependencies;
  logger.info("Fetching earthquake data from api", { startTime, endTime });

  const earthquakes = await usgsService.listEarthquakes({
    latitude: EUROPE_CENTER_LATITUDE,
    longitude: EUROPE_CENTER_LONGITUDE,
    maxRadiusKm: EUROPE_MAX_RADIUS_KM,
    startTime,
    endTime,
  });

  logger.info("Earthquake data fetched", { count: earthquakes.length });

  if (earthquakes.length === 0) {
    return { totalFetched: 0, successfullyWritten: 0 };
  }

  const successfullyWritten =
    await earthquakeRepository.batchSaveEarthquakes(earthquakes);

  return { totalFetched: earthquakes.length, successfullyWritten };
}
