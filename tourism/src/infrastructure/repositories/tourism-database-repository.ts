import { UNESCOSites } from "@domain/entities/unesco-sites";
import type { Dependencies } from "@infrastructure/dependencies";

export async function makeTourismInformationRepository({
  rdsClient,
}: Pick<Dependencies, "rdsClient">) {
  return {
    async getTourismInformation(countryName: string): Promise<UNESCOSites[]> {
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
        rowMapper: (row) =>
          new UNESCOSites(
            row.country_code as string,
            row.country_name as string,
            row.area_name as string,
            row.site as string,
            row.description as string | undefined,
          ),
      });

      return sites;
    },
  };
}
