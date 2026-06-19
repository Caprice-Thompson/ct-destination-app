import type { CountryRestApiService } from "@application/interfaces/services";
import {
  Coordinates,
  CountryFacts,
  Currency,
  MapDetails,
} from "@domain/entities/country-facts";
import type { Dependencies } from "@infrastructure/dependencies";

interface RestCountriesApiResponse {
  data: {
    objects: Array<{
      names: {
        common: string;
      };
      codes: {
        alpha_2: string;
      };
      capitals?: Array<{
        name: string;
      }>;
      languages?: Array<{
        iso639_1: string;
        name: string;
      }>;
      currencies?: Array<{
        code: string;
        name: string;
        symbol: string;
      }>;
      coordinates: {
        lat: number;
        lng: number;
      };
      links: {
        google_maps: string;
        open_street_maps: string;
      };
      flag: {
        url_svg: string;
        url_png: string;
      };
      timezones: string[];
    }>;
  };
}

const mapToCountryFacts = (data: RestCountriesApiResponse['data']['objects'][0]): CountryFacts => {
  const firstCurrency = data.currencies?.[0];
  const currency = new Currency(
    firstCurrency?.name ?? "Unknown",
    firstCurrency?.symbol ?? "",
  );
  const languages = data.languages?.map(lang => lang.name) ?? [];
  const coordinates = new Coordinates(
    data.coordinates.lat,
    data.coordinates.lng,
  );
  const maps = new MapDetails(
    data.links.google_maps,
    data.links.open_street_maps,
  );
  const capital = data.capitals?.[0]?.name;
  const flagUrl = data.flag.url_svg ?? data.flag.url_png ?? null;
  const timezone = data.timezones ?? [];

  return new CountryFacts({
    countryCode: data.codes.alpha_2,
    countryName: data.names.common,
    capitalCityName: capital ?? null,
    flagUrl,
    languages,
    currency,
    coordinates,
    maps,
    timezone,
  });
};

export function makeCountryRestApiService({
  config,
  logger,
}: Pick<Dependencies, "config" | "logger">): CountryRestApiService {
  const buildUrl = (countryName: string): string => {
    return `${config.api.restCountriesUrl}?names.common=${encodeURIComponent(countryName)}`;
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
            Authorization: `Bearer ${config.api.restCountriesAuthorization}`,
          },
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch country facts: ${response.status} ${response.statusText}`,
          );
        }

        const apiResponse = (await response.json()) as RestCountriesApiResponse;

        if (!apiResponse.data?.objects?.[0]) {
          logger.warn("No country facts found", { countryName });
          return null;
        }

        logger.info("Country facts fetched successfully", { countryName });

        return mapToCountryFacts(apiResponse.data.objects[0]);
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
