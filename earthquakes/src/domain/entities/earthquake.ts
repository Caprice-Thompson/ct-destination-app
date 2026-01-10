export interface EarthquakeProperties {
  name: string;
  magnitude: number;
  date: string;
  type: string;
  tsunami: number;
}

export class Earthquake {
  public readonly name: string;
  public readonly magnitude: number;
  public readonly date: string;
  public readonly type: string;
  public readonly tsunami: number;

  constructor(properties: EarthquakeProperties) {
    this.name = properties.name;
    this.magnitude = properties.magnitude;
    this.date = properties.date;
    this.type = properties.type;
    this.tsunami = properties.tsunami;
  }
}
