import type { Coordinates } from "@domain/entities/coordinates";
import type { Earthquake } from "@domain/entities/earthquake";

export interface EarthquakeQueryParams {
  latitude: number;
  longitude: number;
  startTime: string;
  endTime: string;
  maxRadiusKm?: number;
  minMagnitude?: number;
  limit?: number;
}

export interface EarthquakeRepository {
  getEarthquakesByCountry(countryName: string): Promise<Earthquake[]>;
  batchSaveEarthquakes(earthquakes: Earthquake[]): Promise<number>;
}

export interface CoordinatesRepository {
  getCoordinatesByCountryName(countryName: string): Promise<Coordinates>;
}
