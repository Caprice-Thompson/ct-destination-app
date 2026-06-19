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
export class CountryFacts {
  private readonly countryCode: string;
  private readonly countryName: string;
  private readonly capitalCityName: string | null;
  private readonly flagUrl: string | null;
  private readonly languages: string[];
  private readonly currency: Currency;
  private readonly coordinates: Coordinates;
  private readonly maps: MapDetails | null;
  private readonly timezone: string[];

  constructor(details: {
    countryCode: string;
    countryName: string;
    capitalCityName: string | null;
    flagUrl: string | null;
    languages: string[];
    currency: Currency;
    coordinates: Coordinates;
    maps: MapDetails | null;
    timezone: string[];
  }) {
    this.countryCode = details.countryCode;
    this.countryName = details.countryName;
    this.capitalCityName = details.capitalCityName;
    this.flagUrl = details.flagUrl;
    this.languages = details.languages;
    this.currency = details.currency;
    this.coordinates = details.coordinates;
    this.maps = details.maps;
    this.timezone = details.timezone;
  }

  get code(): string {
    return this.countryCode;
  }

  get name(): string {
    return this.countryName;
  }

  get capital(): string | null {
    return this.capitalCityName;
  }

  get flag(): string | null {
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

  get mapLinks(): MapDetails | null {
    return this.maps;
  }

  get timezones(): string[] {
    return [...this.timezone];
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
        googleMaps: this.maps?.googleMaps,
        openStreetMaps: this.maps?.openStreetMaps,
      },
      timezone: this.timezone,
    };
  }
}
