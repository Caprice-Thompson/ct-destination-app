import { CountryApiRepository, CountryDataRepository } from './interfaces/repositories';
import { CountryDetail } from '@domain/entities/country-detail';
import { CityPopulation } from '@domain/entities/city-population';
import { NationalDish } from '@domain/entities/national-dish';

export interface CountryInformationResult {
  countryDetails: CountryDetail | null;
  capitalPopulation: CityPopulation | null;
  nationalDish: NationalDish | null;
}

export class ListCountryInformationUseCase {
  constructor(
    private readonly countryApiRepository: CountryApiRepository,
    private readonly countryDataRepository: CountryDataRepository,
  ) {}

  async executeUseCase(countryName: string): Promise<CountryInformationResult> {
    const countryDetails = await this.countryApiRepository.getCountryDetailsByName(countryName);

    if (!countryDetails) {
      throw new Error(`Country not found: ${countryName}`);
    }

    const countryCode = countryDetails.code;
    const capitalName = countryDetails.capital;

    // promise all here wise?
    const [capitalPopulation, nationalDish] = await Promise.all([
      this.countryDataRepository.getCityPopulation(capitalName, countryCode),
      this.countryDataRepository.getNationalDish(countryCode),
    ]);

    return {
      countryDetails,
      capitalPopulation,
      nationalDish,
    };
  }
}
