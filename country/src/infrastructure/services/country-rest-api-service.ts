import type { CountryRestApiService } from "@application/interfaces/services";
import {
  Coordinates,
  CountryFacts,
  Currency,
  MapDetails,
} from "@domain/entities/country-facts";
import type { Dependencies } from "@infrastructure/dependencies";

interface RestCountriesApiResponse {
  name: {
    common: string;
  };
  cca2: string;
  capital?: string[];
  languages?: Record<string, string>;
  currencies?: Record<
    string,
    {
      name: string;
      symbol: string;
    }
  >;
  latlng?: [number, number];
  maps?: {
    googleMaps: string;
    openStreetMaps: string;
  };
  flags?: {
    svg: string;
    png: string;
  };
}

const mapToCountryFacts = (data: RestCountriesApiResponse): CountryFacts => {
  const currencyCode = data.currencies ? Object.keys(data.currencies)[0] : null;
  const currencyData =
    currencyCode && data.currencies ? data.currencies[currencyCode] : null;
  const currency = new Currency(
    currencyData?.name ?? "Unknown",
    currencyData?.symbol ?? "",
  );
  const languages = data.languages ? Object.values(data.languages) : [];
  const coordinates = new Coordinates(
    data.latlng?.[0] ?? 0,
    data.latlng?.[1] ?? 0,
  );
  const maps = new MapDetails(
    data.maps?.googleMaps ?? "",
    data.maps?.openStreetMaps ?? "",
  );
  const capital = data.capital?.[0];
  const flagUrl = data.flags?.svg ?? data.flags?.png ?? null;

  return new CountryFacts({
    countryCode: data.cca2,
    countryName: data.name.common,
    capitalCityName: capital ?? null,
    flagUrl,
    languages,
    currency,
    coordinates,
    maps,
  });
};

export function makeCountryRestApiService({
  config,
  logger,
}: Pick<Dependencies, "config" | "logger">): CountryRestApiService {
  const buildUrl = (countryName: string): string => {
    return `${config.api.restCountriesUrl}/${encodeURIComponent(countryName)}`;
  };

  return {
    async getCountryFacts(countryName: string): Promise<CountryFacts | null> {
      try {
        const url = buildUrl(countryName);

        logger.info("Fetching country facts from REST Countries API", {
          countryName,
          url,
        });

        const response = await fetch(url, {
          method: "GET",
          headers: {
            accept: "application/json",
            "cache-control": "no-cache",
          },
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch country facts: ${response.status} ${response.statusText}`,
          );
        }

        const data = (await response.json()) as RestCountriesApiResponse[];

        if (!data || !Array.isArray(data) || data.length === 0) {
          logger.warn("No country facts found", { countryName });
          return null;
        }

        logger.info("Country facts fetched successfully", { countryName });

        return mapToCountryFacts(data[0]);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        logger.error("Failed to fetch country facts from REST Countries API", {
          countryName,
          error: errorMessage,
        });
        throw new Error(`Failed to fetch country details: ${errorMessage}`);
      }
    },
  };
}
