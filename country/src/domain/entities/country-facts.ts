import { th } from "zod/v4/locales";

// Value Objects
export class Currency {
  constructor(
    public readonly name: string,
    public readonly symbol: string,
  ) {}
}

export class Coordinates {
  constructor(
    public readonly latitude: number,
    public readonly longitude: number,
  ) {}
}

export class MapDetails {
  constructor(
    public readonly googleMaps: string,
    public readonly openStreetMaps: string,
  ) {}
}

export class DrivingSide {
  constructor(public readonly side: string) {}
}
// Entity
export class CountryFacts {
  public readonly countryCode: string;
  public readonly countryName: string;
  public readonly capitalCityName: string | null;
  public readonly flagUrl: string | null;
  public readonly languages: string[];
  public readonly currency: Currency;
  public readonly coordinates: Coordinates;
  public readonly maps: MapDetails | null;
  public readonly population: number;
  public readonly timezone: string[];
  public readonly continent: string;
  public readonly drivingSide: DrivingSide;

  constructor(details: {
    countryCode: string;
    countryName: string;
    capitalCityName: string;
    flagUrl: string | null;
    languages: string[];
    currency: Currency;
    coordinates: Coordinates;
    maps: MapDetails | null;
    population: number;
    timezone: string[];
    continent: string;
    drivingSide: DrivingSide;
  }) {
    this.countryCode = details.countryCode;
    this.countryName = details.countryName;
    this.capitalCityName = details.capitalCityName;
    this.flagUrl = details.flagUrl;
    this.languages = details.languages;
    this.currency = details.currency;
    this.coordinates = details.coordinates;
    this.maps = details.maps;
    this.population = details.population;
    this.timezone = details.timezone;
    this.continent = details.continent;
    this.drivingSide = details.drivingSide;
  }

  toJSON() {
    return {
      countryCode: this.countryCode,
      countryName: this.countryName,
      continent: this.continent,
      capitalCityName: this.capitalCityName,
      flagUrl: this.flagUrl,
      languages: this.languages,
      population: this.population,
      timezone: this.timezone,
      drivingSide: {
        side: this.drivingSide.side,
      },
      currency: {
        name: this.currency.name,
        symbol: this.currency.symbol,
      },
      coordinates: {
        latitude: this.coordinates.latitude,
        longitude: this.coordinates.longitude,
      },
      maps: {
        googleMaps: this.maps?.googleMaps,
        openStreetMaps: this.maps?.openStreetMaps,
      },
    };
  }
}
