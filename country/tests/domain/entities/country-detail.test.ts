import { CountryDetail, Currency, Coordinates, MapDetails } from '@domain/entities/country-detail';

describe('Currency Value Object', () => {
  it('should create a currency with name and symbol', () => {
    const currency = new Currency('Euro', '€');

    expect(currency.name).toBe('Euro');
    expect(currency.symbol).toBe('€');
  });
});

describe('Coordinates Value Object', () => {
  it('should create coordinates with latitude and longitude', () => {
    const coords = new Coordinates(40.0, -4.0);

    expect(coords.latitude).toBe(40.0);
    expect(coords.longitude).toBe(-4.0);
  });

  it('should handle negative coordinates', () => {
    const coords = new Coordinates(-33.8688, 151.2093);

    expect(coords.latitude).toBe(-33.8688);
    expect(coords.longitude).toBe(151.2093);
  });
});

describe('MapDetails Value Object', () => {
  it('should create map details with both URLs', () => {
    const maps = new MapDetails('https://google.com/maps', 'https://osm.org');

    expect(maps.googleMaps).toBe('https://google.com/maps');
    expect(maps.openStreetMaps).toBe('https://osm.org');
  });
});

describe('CountryDetail Entity', () => {
  const createTestCountry = () => {
    return new CountryDetail({
      countryCode: 'ES',
      countryName: 'Spain',
      capitalCityName: 'Madrid',
      flagUrl: 'https://flagcdn.com/es.svg',
      languages: ['Spanish', 'Catalan', 'Basque'],
      currency: new Currency('Euro', '€'),
      coordinates: new Coordinates(40.0, -4.0),
      maps: new MapDetails('https://goo.gl/maps/spain', 'https://osm.org/spain'),
    });
  };

  describe('Getters', () => {
    it('should return country code', () => {
      const country = createTestCountry();
      expect(country.code).toBe('ES');
    });

    it('should return country name', () => {
      const country = createTestCountry();
      expect(country.name).toBe('Spain');
    });

    it('should return capital city', () => {
      const country = createTestCountry();
      expect(country.capital).toBe('Madrid');
    });

    it('should return flag URL', () => {
      const country = createTestCountry();
      expect(country.flag).toBe('https://flagcdn.com/es.svg');
    });

    it('should return currency info', () => {
      const country = createTestCountry();
      const currency = country.currencyInfo;

      expect(currency.name).toBe('Euro');
      expect(currency.symbol).toBe('€');
    });

    it('should return location coordinates', () => {
      const country = createTestCountry();
      const location = country.location;

      expect(location.latitude).toBe(40.0);
      expect(location.longitude).toBe(-4.0);
    });

    it('should return map links', () => {
      const country = createTestCountry();
      const maps = country.mapLinks;

      expect(maps.googleMaps).toBe('https://goo.gl/maps/spain');
      expect(maps.openStreetMaps).toBe('https://osm.org/spain');
    });
  });

  describe('toJSON', () => {
    it('should serialize to JSON correctly', () => {
      const country = createTestCountry();
      const json = country.toJSON();

      expect(json).toEqual({
        countryCode: 'ES',
        countryName: 'Spain',
        capitalCityName: 'Madrid',
        flagUrl: 'https://flagcdn.com/es.svg',
        languages: ['Spanish', 'Catalan', 'Basque'],
        currency: {
          name: 'Euro',
          symbol: '€',
        },
        coordinates: {
          latitude: 40.0,
          longitude: -4.0,
        },
        maps: {
          googleMaps: 'https://goo.gl/maps/spain',
          openStreetMaps: 'https://osm.org/spain',
        },
      });
    });

    it('should handle empty languages array', () => {
      const country = new CountryDetail({
        countryCode: 'XX',
        countryName: 'Test Country',
        capitalCityName: 'Test City',
        flagUrl: 'https://flag.url',
        languages: [],
        currency: new Currency('Unknown', ''),
        coordinates: new Coordinates(0, 0),
        maps: new MapDetails('', ''),
      });

      const json = country.toJSON();
      expect(json.languages).toEqual([]);
    });
  });
});
