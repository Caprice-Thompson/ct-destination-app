import type { EarthquakeEvent } from "@infrastructure/services/earthquakes-api-service";
import { validateGetNewEarthquakesRequest } from "./get-real-time-earthquakes-validator";
import type { Dependencies } from "@infrastructure/dependencies";


export type GetNewEarthquakesQuery = Readonly<{
  userId: string;
}>;

export interface NotificationResponse {
  newEvents: EarthquakeEvent[];
  lastChecked: Date;
}
  
export async function getNewEarthquakes(
  query: GetNewEarthquakesQuery,
  dependencies: Pick<Dependencies, "earthquakeEventsRepository" | "userRepository" | "logger">,
): Promise<NotificationResponse> {
  const { earthquakeEventsRepository, userRepository, logger } = dependencies;
  const { userId } = await validateGetNewEarthquakesRequest(query);
  const now = new Date();

  logger.info("Starting get new earthquakes notification query", { userId });

  const lastChecked =
    await userRepository.getLastNotificationsCheckedAt(userId);
  const baseline = lastChecked ?? now;
  const newEvents =
    await earthquakeEventsRepository.findEarthquakesAfterDate(baseline);

  await userRepository.updateLastNotificationsCheckedAt(userId, now);

  logger.info("Get new earthquakes notification query completed", {
    userId,
    newEventsCount: newEvents.length,
  });

  return {
    newEvents,
    lastChecked: now,
  };
}
