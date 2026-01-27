export interface EarthquakeProperties {
  eventId: string;
  name: string;
  magnitude: number;
  date: string;
  type: string;
  tsunami: number;
  place: string;
  country: string;
}

export class Earthquake {
  public readonly eventId: string;
  public readonly name: string;
  public readonly magnitude: number;
  public readonly date: string;
  public readonly type: string;
  public readonly tsunami: number;
  public readonly place: string;
  public readonly country: string;

  constructor(properties: EarthquakeProperties) {
    this.eventId = properties.eventId;
    this.name = properties.name;
    this.magnitude = properties.magnitude;
    this.date = properties.date;
    this.type = properties.type;
    this.tsunami = properties.tsunami;
    this.place = properties.place;
    this.country = properties.country;
  }
}
