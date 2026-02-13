import logger from "@infrastructure/logger";
import type {
  CountryApiRepositoryInterface,
  CountryDatabaseRepositoryInterface,
  PopulationApiRepositoryInterface,
} from "./interfaces/repositories";

export interface CountryInformationResult {
  countryDetails: {
    countryCode: string;
    countryName: string;
    capitalCityName: string;
    flagUrl: string;
    languages: string[];
    population: number;
    timezone: string[];
    continent: string;
    drivingSide: {
      side: string;
    };
    currency: {
      name: string;
      symbol: string;
    };
    coordinates: {
      latitude: number;
      longitude: number;
    };
    maps: {
      googleMaps: string;
      openStreetMaps: string;
    };
  };
  cityPopulation?: {
    cityName: string;
    population: number;
  }[];

  nationalDish?: {
    countryCode?: string | null;
    countryName: string;
    dishName: string;
    imageUrl: string | null;
    description?: string;
  };
}

export class ListCountryInformation {
  constructor(
    private readonly countryApiRepository: CountryApiRepositoryInterface,
    private readonly countryDatabaseRepository: CountryDatabaseRepositoryInterface,
    private readonly populationApiRepository: PopulationApiRepositoryInterface,
  ) {}

  async listCountryInfo(
    countryName: string,
  ): Promise<CountryInformationResult> {
    logger.info(`Fetching Country facts for country name: ${countryName}`);
    const countryFacts =
      await this.countryApiRepository.getCountryFacts(countryName);
    if (!countryFacts) {
      throw new Error(`Country Facts not found: ${countryName}`);
    }

    const [nationalDish, cityPopulations] = await Promise.all([
      this.countryDatabaseRepository.getNationalDish(countryName),
      this.countryDatabaseRepository.getCityPopulationsFromDB(countryName),
    ]);

    return {
      countryDetails: {
        countryCode: countryFacts.countryCode,
        countryName: countryFacts.countryName,
        capitalCityName: countryFacts.capitalCityName ?? "",
        flagUrl: countryFacts.flagUrl ?? "",
        languages: countryFacts.languages,
        population: countryFacts.population,
        timezone: countryFacts.timezone,
        continent: countryFacts.continent,
        drivingSide: {
          side: countryFacts.drivingSide.side,
        },
        currency: {
          name: countryFacts.currency.name,
          symbol: countryFacts.currency.symbol,
        },
        coordinates: {
          latitude: countryFacts.coordinates.latitude,
          longitude: countryFacts.coordinates.longitude,
        },
        maps: {
          googleMaps: countryFacts.maps?.googleMaps ?? "",
          openStreetMaps: countryFacts.maps?.openStreetMaps ?? "",
        },
      },
      cityPopulation:
        cityPopulations && cityPopulations.length > 0
          ? cityPopulations.map((cp) => ({
              cityName: cp.cityName,
              population: cp.population,
            }))
          : undefined,
      nationalDish: nationalDish
        ? {
            countryCode: nationalDish.countryCode,
            countryName: nationalDish.countryName,
            dishName: nationalDish.dishName,
            imageUrl: nationalDish.imageUrl,
            description: nationalDish.description,
          }
        : undefined,
    };
  }
}
