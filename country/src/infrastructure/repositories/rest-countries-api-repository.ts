import { CountryApiRepositoryInterface } from '@application/interfaces/repositories';
import { CountryFacts, Currency, Coordinates, MapDetails } from '@domain/entities/country-facts';
import { logger } from '@infrastructure/logger';

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

export class RestCountriesApiRepository implements CountryApiRepositoryInterface {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getCountryFacts(countryName: string): Promise<CountryFacts | null> {
    try {
      const response = await fetch(`${this.baseUrl}/name/${encodeURIComponent(countryName)}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data: RestCountriesApiResponse[] = await response.json();

      if (!data || data.length === 0) {
        return null;
      }

      const countryData = data[0];

      return this.mapToCountryDetail(countryData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.debug('Error fetching country details from REST Countries API', {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new Error(`Failed to fetch country details: ${errorMessage}`);
    }
  }

  private mapToCountryDetail(data: RestCountriesApiResponse): CountryFacts {
    const currencyCode = data.currencies ? Object.keys(data.currencies)[0] : null;
    const currencyData = currencyCode && data.currencies ? data.currencies[currencyCode] : null;
    const currency = new Currency(currencyData?.name || 'Unknown', currencyData?.symbol || '');

    // Extract languages
    const languages = data.languages ? Object.values(data.languages) : [];

    // Extract coordinates
    const coordinates = new Coordinates(data.latlng?.[0] || 0, data.latlng?.[1] || 0);
    // Extract map details
    const maps = new MapDetails(data.maps?.googleMaps ?? '', data.maps?.openStreetMaps ?? '');

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
  }
}
