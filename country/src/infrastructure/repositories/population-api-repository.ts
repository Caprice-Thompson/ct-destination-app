import { PopulationApiRepositoryInterface } from '@application/interfaces/repositories';
import { CityPopulation } from '@domain/entities/city-population';
import { logger } from '@infrastructure/logger';

interface PopulationAPIResponse {
  total_count: number;
  results: Array<{
    geoname_id: string;
    name: string;
    ascii_name: string;
    alternate_names: string[];
    feature_class: string;
    feature_code: string;
    country_code: string;
    cou_name_en: string;
    population: number;
    timezone: string;
    coordinates: {
      lon: number;
      lat: number;
    };
  }>;
}

export class PopulationApiRepository implements PopulationApiRepositoryInterface {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getTopCityPopulations(countryName: string): Promise<CityPopulation | null> {
    const params = new URLSearchParams({
      order_by: 'population DESC',
      limit: '4',
      refine: 'timezone:"Europe"',
      where: `cou_name_en='${countryName.replace(/'/g, "\\'")}'`,
    });
    const url = `${this.baseUrl}/population?${params.toString()}`;
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data: PopulationAPIResponse = await response.json();

      return new CityPopulation({
        cityName: data.results[0].name,
        countryCode: data.results[0].cou_name_en,
        population: data.results[0].population,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.debug('Error fetching top city populations from Population API', {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new Error(`Failed to fetch top city populations: ${errorMessage}`);
    }
  }
}
