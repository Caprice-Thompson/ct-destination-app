import type { EarthquakeEvent } from "@domain/entities/earthquake-event";

export interface EarthquakeEventsRepository {
  findSince(timestamp: Date): Promise<EarthquakeEvent[]>;
}

export interface UserRepository {
  getLastNotificationsCheckedAt(userId: string): Promise<Date | null>;
  updateLastNotificationsCheckedAt(
    userId: string,
    timestamp: Date,
  ): Promise<void>;
}
