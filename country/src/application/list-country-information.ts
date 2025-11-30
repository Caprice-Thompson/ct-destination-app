import { CountryApiRepositoryInterface, CountryDatabaseRepositoryInterface } from './interfaces/repositories';

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
  capitalPopulation?: {
    cityName: string;
    countryCode: string;
    population: number;
  };
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
  ) {}

  async listCountryInfo(countryName: string): Promise<CountryInformationResult> {
    const countryFacts = await this.countryApiRepository.getCountryDetailsByName(countryName);

    if (!countryFacts) {
      throw new Error(`Country not found: ${countryName}`);
    }

    const [capitalPopulation, nationalDish] = await Promise.all([
      this.countryDatabaseRepository.getTopCityPopulations(countryName),
      this.countryDatabaseRepository.getNationalDish(countryName),
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
      capitalPopulation: capitalPopulation
        ? {
            cityName: capitalPopulation.cityName,
            countryCode: capitalPopulation.countryCode,
            population: capitalPopulation.population,
          }
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
