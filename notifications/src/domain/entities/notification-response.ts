import type { EarthquakeEvent } from "./earthquake-event";

export interface NotificationResponse {
  newEvents: EarthquakeEvent[];
  lastChecked: Date;
}
