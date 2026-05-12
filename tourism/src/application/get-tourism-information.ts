import { logger } from "@infrastructure/logger";
import type { TourismInformationRepositoryInterface } from "./interfaces/tourism-repo";

export interface TourismInformationResult {
  unescoSites: {
    countryCode: string;
    countryName: string;
    areaName: string;
    site: string;
    description?: string;
  }[];
}

export class GetTourismInformation {
  constructor(
    private readonly tourismRepository: TourismInformationRepositoryInterface,
  ) {}

  async getTourismInfo(countryName: string): Promise<TourismInformationResult> {
    logger.info(`Fetching tourism information for country: ${countryName}`);

    const unescoSites =
      await this.tourismRepository.getTourismInformation(countryName);

    if (!unescoSites || unescoSites.length === 0) {
      logger.info(`No tourism information found for country: ${countryName}`);
      return {
        unescoSites: [],
      };
    }

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
}
