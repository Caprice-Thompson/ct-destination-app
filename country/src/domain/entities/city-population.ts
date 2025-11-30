export class CityPopulation {
  public readonly cityName: string;
  public readonly countryCode: string;
  public readonly population: number;
  constructor(cityPopulation: { cityName: string; countryCode: string; population: number }) {
    this.cityName = cityPopulation.cityName;
    this.countryCode = cityPopulation.countryCode;
    this.population = cityPopulation.population;
  }
  public getPopulation() {
    return this.population;
  }
  public getCountryCode() {
    return this.countryCode;
  }
  public getCityName() {
    return this.cityName;
  }
}
