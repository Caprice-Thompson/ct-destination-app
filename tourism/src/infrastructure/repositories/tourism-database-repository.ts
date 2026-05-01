<<<<<<< Updated upstream
import { TourismInformationRepositoryInterface } from '@application/interfaces/tourism-repo';
import { UNESCOSites } from '@domain/entities/unesco-sites';
import { DbClient, QueryResultRow } from '../rds';
import logger from '../logger';

export class TourismDatabaseRepository implements TourismInformationRepositoryInterface {
  constructor(private readonly dbClient: DbClient) {}

  async getTourismInformation(countryName: string): Promise<UNESCOSites[]> {
    try {
      logger.info(`Querying tourism database for country: ${countryName}`);
=======

import { UNESCOSites } from "@domain/entities/unesco-sites";
import { Dependencies } from "@infrastructure/dependencies";

export async function makeTourismInformationRepository({ rdsClient }: Pick<Dependencies, "rdsClient">) {
  return {
    async getTourismInformation(countryName: string): Promise<UNESCOSites[]> {
>>>>>>> Stashed changes

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

      const sites = await rdsClient.queryMultipleRows<UNESCOSites>({
        query,
        bindVariables: [countryName],
        rowMapper: (row) => new UNESCOSites(
          row.country_code as string,
          row.country_name as string,
          row.area_name as string,
          row.site as string,
          row.description as string | undefined,
        ),
      });

<<<<<<< Updated upstream
      logger.info(`Found ${sites.length} UNESCO sites for country: ${countryName}`);
      return sites;
    } catch (error) {
      logger.error('Error fetching tourism information from database', {
        countryName,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new Error(
        `Failed to fetch tourism information: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
=======
      return sites;
>>>>>>> Stashed changes
    }
  };
}
