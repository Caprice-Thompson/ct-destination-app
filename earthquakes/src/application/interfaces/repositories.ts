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
  countryName?: string; // Optional: if provided, skip geocoding
}

export interface EarthquakeRepositoryInterface {
  getMostRecentEarthquakesByCountry(
    params: EarthquakeQueryParams,
  ): Promise<Earthquake[]>;
  getEarthquakeIngestData(
    params: Pick<EarthquakeQueryParams, "startTime" | "endTime">,
  ): Promise<Earthquake[]>;
  enrichEarthquakesWithCountry(
    earthquakes: Earthquake[],
  ): Promise<Earthquake[]>;
}

export interface CoordinatesRepositoryInterface {
  getCoordinatesByCountryName(countryName: string): Promise<Coordinates>;
}

export interface HistoricalEarthquakeRepository {
  getEarthquakesByCountry(countryName: string): Promise<Earthquake[]>;
  batchSaveEarthquakes(earthquakes: Earthquake[]): Promise<number>;
  checkExistingEarthquakes(
    eventIds: string[],
    times: string[],
  ): Promise<Set<string>>;
}
