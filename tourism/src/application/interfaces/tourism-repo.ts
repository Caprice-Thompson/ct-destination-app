import { UNESCOSites } from '@domain/entities/unesco-sites';

export interface TourismInformationRepositoryInterface {
  getTourismInformation(countryName: string): Promise<UNESCOSites[]>;
}
