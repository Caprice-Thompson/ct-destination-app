
import { logger } from "@infrastructure/logger";
import type { Dependencies } from "@infrastructure/dependencies";
import { validateGetTourismInformationRequest } from "./validator";

export interface GetTourismInformationQuery {
  countryName: string;
}

export async function getTourismInfo(query: GetTourismInformationQuery, dependencies: Dependencies) {
  logger.info(`Fetching tourism information for country: ${query.countryName}`);
  const validatedQuery = await validateGetTourismInformationRequest(query);
  const unescoSites =
    await dependencies.tourismInformationRepository.getTourismInformation(validatedQuery.countryName);

  logger.info("Query validated successfully", { validatedQuery });

  if (!unescoSites || unescoSites.length === 0) {
    logger.info(`No tourism information found for country: ${validatedQuery.countryName}`);
    return {
      unescoSites: [],
    };
  }
  logger.info("Tourism information found successfully");

  return {
    unescoSites: unescoSites.map((site) => ({
      countryCode: site.countryCode,
      countryName: site.countryName, // states_name_en
      areaName: site.areaName,
      site: site.site, // name_en
      description: site.description, // short_description_en
    })),
  };
}
