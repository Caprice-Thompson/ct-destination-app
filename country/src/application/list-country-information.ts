import {
  CountryApiRepositoryInterface,
  CountryDatabaseRepositoryInterface,
  PopulationApiRepositoryInterface,
} from './interfaces/repositories';

export interface CountryInformationResult {
  countryDetails: {
    countryCode: string;
    countryName: string;
    capitalCityName: string;
    flagUrl: string;
    languages: string[];
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
    countryCode: string;
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

  async listCountryInfo(countryName: string): Promise<CountryInformationResult> {
    const countryFacts = await this.countryApiRepository.getCountryFacts(countryName);

    if (!countryFacts) {
      throw new Error(`Country not found: ${countryName}`);
    }

    const [nationalDish, cityPopulations] = await Promise.all([
      this.countryDatabaseRepository.getNationalDish(countryName),
      this.populationApiRepository.getTopCityPopulations(countryName),
    ]);

    return {
      countryDetails: {
        countryCode: countryFacts.code,
        countryName: countryFacts.name,
        capitalCityName: countryFacts.capital ?? '',
        flagUrl: countryFacts.flag ?? '',
        languages: countryFacts.languageList,
        currency: {
          name: countryFacts.currencyInfo.name,
          symbol: countryFacts.currencyInfo.symbol,
        },
        coordinates: {
          latitude: countryFacts.location.latitude,
          longitude: countryFacts.location.longitude,
        },
        maps: {
          googleMaps: countryFacts.mapLinks?.googleMaps ?? '',
          openStreetMaps: countryFacts.mapLinks?.openStreetMaps ?? '',
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
            dishName: nationalDish.dishName,
            imageUrl: nationalDish.imageUrl,
            description: nationalDish.description,
          }
        : undefined,
    };
  }
}
