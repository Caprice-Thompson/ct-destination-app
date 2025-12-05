import { makeDependencies, type Dependencies } from '@infrastructure/dependencies';
import { logger } from '@infrastructure/logger';

export interface EventBridgeEvent {
  id: string;
  'detail-type': string;
  source: string;
  account: string;
  time: string;
  detail: {
    countries?: string[];
  };
}

export interface IngestCountryDataResponse {
  statusCode: number;
  body: string;
}

let dependencies: Dependencies | null = null;

export const resetDependencies = () => {
  dependencies = null;
};

/**
 * Lambda handler for EventBridge-triggered country data ingestion
 * This handler is triggered daily by EventBridge to fetch data from external APIs
 * and store it in the database
 */
export const ingestCountryDataHandler = async (event: EventBridgeEvent): Promise<IngestCountryDataResponse> => {
  try {
    logger.info('EventBridge triggered data ingestion', {
      eventId: event.id,
      detailType: event['detail-type'],
      source: event.source,
      time: event.time,
    });

    if (!dependencies) {
      dependencies = await makeDependencies();
    }

    const useCase = dependencies.ingestCountryDataUseCase;

    const countriesToIngest = event.detail?.countries || getDefaultCountries();

    logger.info('Starting data ingestion', {
      countryCount: countriesToIngest.length,
      countries: countriesToIngest,
    });

    const results = await useCase.ingestForMultipleCountries(countriesToIngest);

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.length - successCount;

    const response = {
      message: 'Data ingestion completed',
      summary: {
        total: results.length,
        successful: successCount,
        failed: failureCount,
      },
      results: results.map((r) => ({
        countryName: r.countryName,
        success: r.success,
        populationIngested: r.populationIngested,
        errors: r.errors,
      })),
    };

    logger.info('Data ingestion completed successfully', {
      total: results.length,
      successful: successCount,
      failed: failureCount,
    });

    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    logger.error('Error in ingestCountryDataHandler', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      eventId: event.id,
    });

    const errorMessage = error instanceof Error ? error.message : 'Internal server error';

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Data ingestion failed',
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
      }),
    };
  }
};

/**
 * Default list of countries to ingest data
 */
function getDefaultCountries(): string[] {
  return [
    'Albania',
    'Andorra',
    'Austria',
    'Belarus',
    'Belgium',
    'Bosnia and Herzegovina',
    'Bulgaria',
    'Croatia',
    'Cyprus',
    'Czech Republic',
    'Denmark',
    'Estonia',
    'Finland',
    'France',
    'Germany',
    'Greece',
    'Hungary',
    'Iceland',
    'Ireland',
    'Italy',
    'Kosovo',
    'Latvia',
    'Liechtenstein',
    'Lithuania',
    'Luxembourg',
    'Malta',
    'Moldova',
    'Monaco',
    'Montenegro',
    'Netherlands',
    'North Macedonia',
    'Norway',
    'Poland',
    'Portugal',
    'Romania',
    'Russia',
    'San Marino',
    'Serbia',
    'Slovakia',
    'Slovenia',
    'Spain',
    'Sweden',
    'Switzerland',
    'Ukraine',
    'United Kingdom',
    'Vatican City',
  ];
}
