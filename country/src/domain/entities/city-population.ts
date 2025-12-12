export class CityPopulation {
  public readonly cityName: string;
  public readonly population: number;
  constructor(cityPopulation: { cityName: string; population: number }) {
    this.cityName = cityPopulation.cityName;
    this.population = cityPopulation.population;
  }
  public getPopulation() {
    return this.population;
  }
  public getCityName() {
    return this.cityName;
  }
}
