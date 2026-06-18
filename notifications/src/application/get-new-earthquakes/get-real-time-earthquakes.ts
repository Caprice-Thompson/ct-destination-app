import type { Logger } from "@application/interfaces/logger";
import type {
  EarthquakeEventsRepository,
  UserRepository,
} from "@application/interfaces/repositories";
import type { NotificationResponse } from "@domain/entities/notification-response";
import { validateGetNewEarthquakesRequest } from "./get-real-time-earthquakes-validator";

export type GetNewEarthquakesQuery = Readonly<{
  userId: string;
}>;

export type GetNewEarthquakesDependencies = Readonly<{
  earthquakeEventsRepository: EarthquakeEventsRepository;
  userRepository: UserRepository;
  logger: Logger;
}>;

export async function getNewEarthquakesUseCase(
  query: GetNewEarthquakesQuery,
  dependencies: GetNewEarthquakesDependencies,
): Promise<NotificationResponse> {
  const { earthquakeEventsRepository, userRepository, logger } = dependencies;
  const { userId } = await validateGetNewEarthquakesRequest(query);
  const now = new Date();

  logger.info("Starting get new earthquakes notification query", { userId });

  const lastChecked =
    await userRepository.getLastNotificationsCheckedAt(userId);
  const baseline = lastChecked ?? now;
  const newEvents = await earthquakeEventsRepository.findSince(baseline);

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
