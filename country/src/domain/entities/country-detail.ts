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

// Entity
export class CountryDetail {
  private readonly countryCode: string;
  private readonly countryName: string;
  private readonly capitalCityName: string;
  private readonly flagUrl: string;
  private readonly languages: string[];
  private readonly currency: Currency;
  private readonly coordinates: Coordinates;
  private readonly maps: MapDetails;

  constructor(details: {
    countryCode: string;
    countryName: string;
    capitalCityName: string;
    flagUrl: string;
    languages: string[];
    currency: Currency;
    coordinates: Coordinates;
    maps: MapDetails;
  }) {
    this.countryCode = details.countryCode;
    this.countryName = details.countryName;
    this.capitalCityName = details.capitalCityName;
    this.flagUrl = details.flagUrl;
    this.languages = details.languages;
    this.currency = details.currency;
    this.coordinates = details.coordinates;
    this.maps = details.maps;
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

  get flag(): string {
    return this.flagUrl;
  }

  get languageList(): string[] {
    return [...this.languages];
  }

  get currencyInfo(): Currency {
    return this.currency;
  }

  get location(): Coordinates {
    return this.coordinates;
  }

  get mapLinks(): MapDetails {
    return this.maps;
  }

  toJSON() {
    return {
      countryCode: this.countryCode,
      countryName: this.countryName,
      capitalCityName: this.capitalCityName,
      flagUrl: this.flagUrl,
      languages: this.languages,
      currency: {
        name: this.currency.name,
        symbol: this.currency.symbol,
      },
      coordinates: {
        latitude: this.coordinates.latitude,
        longitude: this.coordinates.longitude,
      },
      maps: {
        googleMaps: this.maps.googleMaps,
        openStreetMaps: this.maps.openStreetMaps,
      },
    };
  }
}
