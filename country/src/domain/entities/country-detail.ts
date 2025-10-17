export class CountryDetail {
  private readonly countryCode: string;
  private readonly countryName: string;
  private readonly capitalCityName: string;
  private readonly topCityNames: string[];
  private readonly topCityPopulations: number[];
  private readonly flagUrl: string;
  private readonly languageSpoken: string[];
  private readonly currencyName: string;
  private readonly currencySymbol: string;

  constructor(details: {
    countryCode: string;
    countryName: string;
    capitalCityName: string;
    topCityNames: string[];
    topCityPopulations: number[];
    flagUrl: string;
    languageSpoken: string[];
    currencyName: string;
    currencySymbol: string;
  }) {
    this.countryCode = details.countryCode;
    this.countryName = details.countryName;
    this.capitalCityName = details.capitalCityName;
    this.topCityNames = details.topCityNames;
    this.topCityPopulations = details.topCityPopulations;
    this.flagUrl = details.flagUrl;
    this.languageSpoken = details.languageSpoken;
    this.currencyName = details.currencyName;
    this.currencySymbol = details.currencySymbol;
  }

  get code(): string {
    return this.countryCode;
  }

  get name(): string {
    return this.countryName;
  }

  get capital(): string {
    return this.capitalCityName;
  }

  get population(): number {
    return this.topCityPopulations.reduce((acc, curr) => acc + curr, 0);
  }

  get languages(): string[] {
    return this.languageSpoken;
  }
}
