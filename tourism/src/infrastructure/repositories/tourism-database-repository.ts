import { TourismInformationRepositoryInterface } from '@application/interfaces/tourism-repo';
import { UNESCOSites } from '@domain/entities/unesco-sites';
import { DbClient, QueryResultRow } from '../rds';
import logger from '../logger';

export class TourismDatabaseRepository implements TourismInformationRepositoryInterface {
  constructor(private readonly dbClient: DbClient) {}

  async getTourismInformation(countryName: string): Promise<UNESCOSites[]> {
    try {
      logger.info(`Querying tourism database for country: ${countryName}`);

      const query = `
        SELECT 
          country_code,
          country_name,
          area_name,
          site,
          description
        FROM unesco_sites
        WHERE LOWER(country_name) = LOWER($1)
        ORDER BY site ASC
      `;

      const sites = await this.dbClient.queryMultipleRows<UNESCOSites>({
        query,
        bindVariables: [countryName],
        rowMapper: this.mapRowToUNESCOSite,
      });

      logger.info(`Found ${sites.length} UNESCO sites for country: ${countryName}`);
      return sites;
    } catch (error) {
      logger.error('Error fetching tourism information from database', {
        countryName,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new Error(`Failed to fetch tourism information: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private mapRowToUNESCOSite(row: QueryResultRow): UNESCOSites {
    return new UNESCOSites(
      row.country_code as string,
      row.country_name as string,
      row.area_name as string,
      row.site as string,
      row.description as string | undefined,
    );
  }
}

