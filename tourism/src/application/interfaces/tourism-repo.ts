import { UNESCOSites } from "@domain/entities/unesco-sites";

export interface ToursimInformationRepositoryInterface {
  getTourismInformation(countryName: string): Promise<UNESCOSites[]>;
}
