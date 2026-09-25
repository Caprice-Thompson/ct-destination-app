export class WeatherData {
  constructor(
    public readonly countryCode: string,
    public readonly countryName: string,
    public readonly capitalCity: string,
    public readonly date: string,
    public readonly minTemperature: number,
    public readonly maxTemperature: number,
    public readonly averageTemperature: number,
  ) {}

  toJSON() {
    return {
      countryCode: this.countryCode,
      countryName: this.countryName,
      capitalCity: this.capitalCity,
      minTemperature: this.minTemperature,
      maxTemperature: this.maxTemperature,
      averageTemperature: this.averageTemperature,
      date: this.date,
    };
  }
}
