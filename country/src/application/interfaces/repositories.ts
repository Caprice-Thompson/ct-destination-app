import type { CityPopulation } from "@domain/entities/city-population";
import type { NationalDish } from "@domain/entities/national-dish";

export interface NationalDishRepository {
  getNationalDish(countryName: string): Promise<NationalDish | null>;
}

export interface CityPopulationRepository {
  getCityPopulations(countryName: string): Promise<CityPopulation[]>;
}
