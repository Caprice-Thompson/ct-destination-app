import type { Earthquake } from "@domain/entities/earthquake";

export interface UsgsService {
  listEarthquakes(params: {
    latitude: number;
    longitude: number;
    startTime: string;
    endTime: string;
    maxRadiusKm?: number;
    minMagnitude?: number;
    limit?: number;
  }): Promise<Earthquake[]>;
}
