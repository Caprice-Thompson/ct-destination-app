import {
  CountryApiRepositoryInterface,
  CountryDatabaseRepositoryInterface,
  PopulationApiRepositoryInterface,
} from './interfaces/repositories';
import { logger } from '@infrastructure/logger';

export interface IngestCountryDataResult {
  countryName: string;
  success: boolean;
  populationIngested: boolean;
  errors?: string[];
}

export class IngestCountryData {
  constructor(
    private readonly countryApiRepository: CountryApiRepositoryInterface,
    private readonly populationApiRepository: PopulationApiRepositoryInterface,
    private readonly countryDatabaseRepository: CountryDatabaseRepositoryInterface,
  ) {}

  async ingestForCountry(countryName: string): Promise<IngestCountryDataResult> {
    const errors: string[] = [];
    let populationIngested = false;

    try {
      // Verify country exists
      // Todo - do a get country name only
      const countryFacts = await this.countryApiRepository.getCountryFacts(countryName);
      if (!countryFacts) {
        throw new Error(`Country not found: ${countryName}`);
      }

      logger.info('Starting data ingestion for country', { countryName });

      // Ingest population data
      try {
        const cityPopulation = await this.populationApiRepository.getTopCityPopulations(countryName);
        if (cityPopulation) {
          await this.countryDatabaseRepository.saveCityPopulation(cityPopulation, countryName);
          populationIngested = true;
          logger.info('Population data ingested successfully', { countryName, cityName: cityPopulation.cityName });
        } else {
          logger.warn('No population data found', { countryName });
          errors.push('No population data available');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Failed to ingest population data', { countryName, error: errorMessage });
        errors.push(`Population ingestion failed: ${errorMessage}`);
      }

      const success = populationIngested;

      logger.info('Data ingestion completed', {
        countryName,
        success,
        populationIngested,
        errorCount: errors.length,
      });

      return {
        countryName,
        success,
        populationIngested,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Data ingestion failed', { countryName, error: errorMessage });

      return {
        countryName,
        success: false,
        populationIngested,
        errors: [errorMessage, ...errors],
      };
    }
  }

  async ingestForMultipleCountries(countryNames: string[]): Promise<IngestCountryDataResult[]> {
    logger.info('Starting batch data ingestion', { countryCount: countryNames.length });

    const results = await Promise.allSettled(countryNames.map((countryName) => this.ingestForCountry(countryName)));

    const processedResults = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        const countryName = countryNames[index];
        logger.error('Batch ingestion failed for country', {
          countryName,
          error: result.reason,
        });
        return {
          countryName,
          success: false,
          populationIngested: false,
          nationalDishIngested: false,
          errors: [result.reason instanceof Error ? result.reason.message : String(result.reason)],
        };
      }
    });

    const successCount = processedResults.filter((r) => r.success).length;
    logger.info('Batch data ingestion completed', {
      total: countryNames.length,
      successful: successCount,
      failed: countryNames.length - successCount,
    });

    return processedResults;
  }
}
