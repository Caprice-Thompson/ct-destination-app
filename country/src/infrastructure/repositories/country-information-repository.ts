import type { CountryInformationRepository } from "@application/interfaces/repositories";
import {
  Coordinates,
  CountryFacts,
  Currency,
  MapDetails,
} from "@domain/entities/country-facts";
import type { Dependencies } from "@infrastructure/dependencies";

export function makeCountryInformationRepository({
  logger,
  rdsClient,
}: Pick<Dependencies, "logger" | "rdsClient">): CountryInformationRepository {
  return {
    async getCountryInformation(
      countryName: string,
    ): Promise<CountryFacts | null> {
      try {
        logger.debug("Starting to fetch country information from database", {
          countryName,
        });

        const result = await rdsClient.querySingleRowOptional<{
          country_name: string;
          country_code: string;
          capital: string;
          languages: string | null;
          currencies: string | null;
          flag_svg: string | null;
          latitude: number;
          longitude: number;
          google_maps_url: string;
          open_street_maps_url: string;
          timezones: string[];
          calling_codes: string | null;
          driving_side: "left" | "right" | null;
          is_eu: boolean;
          is_schengen: boolean;
        }>({
          query: `
            SELECT country_name, capital, languages, currencies, flag_svg, lat, lng, google_maps_url, open_street_maps_url, timezones, calling_codes, driving_side, is_eu, is_schengen
            FROM country_information
            WHERE country_name = $1
          `,
          bindVariables: [countryName],
        });

        if (!result) {
          logger.debug("No country information found", { countryName });
          return null;
        }

        logger.info("Country information fetched successfully", {
          countryName,
        });

        return new CountryFacts({
          countryCode: result.country_code,
          countryName: result.country_name,
          capitalCityName: result.capital,
          flagUrl: result.flag_svg,
          languages: result.languages ? result.languages.split(",") : [],
          currency: result.currencies
            ? new Currency(result.currencies, "")
            : new Currency("", ""),
          coordinates: new Coordinates(result.latitude, result.longitude),
          maps: new MapDetails(
            result.google_maps_url,
            result.open_street_maps_url,
          ),
          timezone: result.timezones ? result.timezones : [],
          callingCodes: result.calling_codes
            ? result.calling_codes.split(",")
            : [],
          drivingSide: result.driving_side || "right",
          europeanUnionMember: result.is_eu,
          schengenAreaMember: result.is_schengen,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        logger.error("Error fetching country information from database", {
          countryName,
          error: errorMessage,
        });
        throw new Error(`Failed to fetch country information: ${errorMessage}`);
      }
    },
  };
}
