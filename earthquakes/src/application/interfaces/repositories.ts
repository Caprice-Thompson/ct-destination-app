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
  getMostRecentEarthquakesByCountry(
    params: EarthquakeQueryParams,
  ): Promise<Earthquake[]>;
  getEarthquakeData(
    params: Pick<EarthquakeQueryParams, "startTime" | "endTime">,
  ): Promise<Earthquake[]>;
}

export interface CoordinatesRepositoryInterface {
  getCoordinatesByCountryName(countryName: string): Promise<Coordinates>;
}

export interface HistoricalEarthquakeRepository {
  getEarthquakesByCountry(countryName: string): Promise<Earthquake[]>;
  batchSaveEarthquakes(earthquakes: Earthquake[]): Promise<number>;
}
