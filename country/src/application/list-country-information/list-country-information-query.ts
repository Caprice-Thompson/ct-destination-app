import type { Dependencies } from "@infrastructure/dependencies";
import { validateCountryInformationRequest } from "./list-country-information-query-validator";

export type ListCountryInformationQuery = Readonly<{
  countryName: string;
}>;

export interface CountryInformationResult {
  countryDetails: {
    countryCode: string;
    countryName: string;
    capitalCityName: string;
    flagUrl: string;
    languages: string[];
    timezone: string[];
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

export async function listCountryInformationQuery(
  query: ListCountryInformationQuery,
  dependencies: Dependencies,
): Promise<CountryInformationResult> {
  const {
    countryApiRepository,
    countryDataRepository,
    populationApiRepository,
    logger,
  } = dependencies;

  logger.info("Starting list country information query", { query });

  const { countryName } = await validateCountryInformationRequest(query);

  logger.debug(`Fetching country facts for country: ${countryName}`);

  const countryFacts = await countryApiRepository.getCountryFacts(countryName);

  if (!countryFacts) {
    throw new Error(`Country Facts not found: ${countryName}`);
  }

  const [nationalDish, cityPopulations] = await Promise.all([
    countryDataRepository.getNationalDish(countryName),
    populationApiRepository.getTopCityPopulations(countryName),
  ]);

  logger.info(
    `List country information query completed successfully for country: ${countryName}`,
    {
      countryName,
      hasNationalDish: !!nationalDish,
      cityPopulationsCount: cityPopulations?.length ?? 0,
    },
  );

  return {
    countryDetails: {
      countryCode: countryFacts.code,
      countryName: countryFacts.name,
      capitalCityName: countryFacts.capital ?? "",
      flagUrl: countryFacts.flag ?? "",
      languages: countryFacts.languageList,
      timezone: countryFacts.timezones,
      currency: {
        name: countryFacts.currencyInfo.name,
        symbol: countryFacts.currencyInfo.symbol,
      },
      coordinates: {
        latitude: countryFacts.location.latitude,
        longitude: countryFacts.location.longitude,
      },
      maps: {
        googleMaps: countryFacts.mapLinks?.googleMaps ?? "",
        openStreetMaps: countryFacts.mapLinks?.openStreetMaps ?? "",
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
