import type { EarthquakeEvent } from "@infrastructure/services/earthquakes-api-service";
export interface EarthquakeEventsRepository {
  findEarthquakesAfterDate(timestamp: Date): Promise<EarthquakeEvent[]>;
}

export interface UserRepository {
  getLastNotificationsCheckedAt(userId: string): Promise<Date | null>;
  updateLastNotificationsCheckedAt(
    userId: string,
    timestamp: Date,
  ): Promise<void>;
}
