export class Temperature {
  constructor(
    public readonly min: number,
    public readonly max: number,
  ) {}
}

export class WeatherData {
  constructor(
    public readonly countryCode: string,
    public readonly countryName: string,
    public readonly date: string,
    public readonly wind: string,
    public readonly temperature: Temperature,
    public readonly humidity: string,
    public readonly pressure: string,
    public readonly visibility: string,
    public readonly windSpeed: string,
  ) {}

  toJSON() {
    return {
      countryCode: this.countryCode,
      countryName: this.countryName,
      wind: this.wind,
      temperature: this.temperature,
      humidity: this.humidity,
      pressure: this.pressure,
      visibility: this.visibility,
      windSpeed: this.windSpeed,
      date: this.date,
    };
  }
}
