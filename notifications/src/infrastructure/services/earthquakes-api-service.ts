import type { ApplicationConfig } from "@application/interfaces/config";
import type { Logger } from "@application/interfaces/logger";
import type { EarthquakeEventsRepository } from "@application/interfaces/repositories";
import type { EarthquakeEvent } from "@domain/entities/earthquake-event";

type EarthquakeApiResponse = {
  earthquakes: Array<{
    eventId: string;
    magnitude: number;
    place: string;
    date: string;
  }>;
};

export function makeEarthquakesApiService({
  config,
  logger,
}: {
  config: ApplicationConfig;
  logger: Logger;
}): EarthquakeEventsRepository {
  return {
    async findSince(timestamp: Date): Promise<EarthquakeEvent[]> {
      const since = timestamp.toISOString();
      const url = `${config.urls.earthquakesApi}?since=${encodeURIComponent(since)}`;

      logger.debug("Fetching earthquakes from API", { url, since });

      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(
            `Earthquakes API failed: ${response.status} ${response.statusText}`,
          );
        }

        const data = (await response.json()) as EarthquakeApiResponse;

        logger.info("Fetched earthquakes from API", {
          count: data.earthquakes.length,
        });

        return data.earthquakes.map((eq) => ({
          id: eq.eventId,
          magnitude: eq.magnitude,
          location: eq.place,
          occurredAt: new Date(eq.date),
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        logger.error("Error fetching earthquakes from API", {
          url,
          error: errorMessage,
        });
        throw new Error(`Failed to fetch earthquakes: ${errorMessage}`);
      }
    },
  };
}
