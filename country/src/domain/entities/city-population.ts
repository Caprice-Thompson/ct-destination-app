export class CityPopulation {
  constructor(
    public readonly cityName: string,
    public readonly countryCode: string,
    public readonly population: number,
  ) {
    if (population < 0) {
      throw new Error('Population cannot be negative');
    }
  }

  toJSON() {
    return {
      cityName: this.cityName,
      countryCode: this.countryCode,
      population: this.population,
    };
  }
}
