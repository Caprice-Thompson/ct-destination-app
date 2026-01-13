import { Earthquake } from "@domain/entities/earthquake";
import { Coordinates } from "@domain/entities/coordinates";

export interface EarthquakeQueryParams {
  latitude: number;
  longitude: number;
  startTime: string;
  endTime: string;
  maxRadiusKm?: number;
  minMagnitude?: number;
  limit?: number;
}

export interface EarthquakeRepositoryInterface {
  getMostRecentEarthquakes(
    params: EarthquakeQueryParams,
  ): Promise<Earthquake[]>;
}

export interface CoordinatesRepositoryInterface {
  getCoordinatesByCountryName(countryName: string): Promise<Coordinates>;
}
