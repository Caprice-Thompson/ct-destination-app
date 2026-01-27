export interface EarthquakeProperties {
  eventId: string;
  name: string;
  magnitude: number;
  date: string;
  type: string;
  tsunami: number;
}

export class Earthquake {
  public readonly eventId: string;
  public readonly name: string;
  public readonly magnitude: number;
  public readonly date: string;
  public readonly type: string;
  public readonly tsunami: number;

  constructor(properties: EarthquakeProperties) {
    this.eventId = properties.eventId;
    this.name = properties.name;
    this.magnitude = properties.magnitude;
    this.date = properties.date;
    this.type = properties.type;
    this.tsunami = properties.tsunami;
  }
}
