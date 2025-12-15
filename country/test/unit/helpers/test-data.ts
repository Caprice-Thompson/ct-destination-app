import { CountryFacts, Currency, Coordinates, MapDetails } from '@domain/entities/country-facts';

/**
 * Test data factory functions for creating domain entities
 */

export const createTestCountry = (
  overrides?: Partial<{
    countryCode: string;
    countryName: string;
    capitalCityName: string;
    flagUrl: string;
    languages: string[];
    currency: Currency;
    coordinates: Coordinates;
    maps: MapDetails;
  }>,
): CountryFacts => {
  return new CountryFacts({
    countryCode: 'ES',
    countryName: 'Spain',
    capitalCityName: 'Madrid',
    flagUrl: 'https://flagcdn.com/es.svg',
    languages: ['Spanish', 'Catalan', 'Basque'],
    currency: new Currency('Euro', '€'),
    coordinates: new Coordinates(40.0, -4.0),
    maps: new MapDetails('https://goo.gl/maps/spain', 'https://osm.org/spain'),
    ...overrides,
  });
};

export const mockRestCountriesApiResponse = (countryName: string) => {
  const responses: Record<string, unknown> = {
    Spain: {
      name: { common: 'Spain' },
      cca2: 'ES',
      capital: ['Madrid'],
      languages: { spa: 'Spanish', cat: 'Catalan', eus: 'Basque' },
      currencies: { EUR: { name: 'Euro', symbol: '€' } },
      latlng: [40.0, -4.0],
      maps: {
        googleMaps: 'https://goo.gl/maps/spain',
        openStreetMaps: 'https://osm.org/spain',
      },
      flags: { svg: 'https://flagcdn.com/es.svg' },
    },
    France: {
      name: { common: 'France' },
      cca2: 'FR',
      capital: ['Paris'],
      languages: { fra: 'French' },
      currencies: { EUR: { name: 'Euro', symbol: '€' } },
      latlng: [46.0, 2.0],
      maps: {
        googleMaps: 'https://goo.gl/maps/france',
        openStreetMaps: 'https://osm.org/france',
      },
      flags: { svg: 'https://flagcdn.com/fr.svg' },
    },
    'United Kingdom': {
      name: { common: 'United Kingdom' },
      cca2: 'GB',
      capital: ['London'],
      languages: { eng: 'English' },
      currencies: { GBP: { name: 'Pound Sterling', symbol: '£' } },
      latlng: [54.0, -2.0],
      maps: {
        googleMaps: 'https://goo.gl/maps/uk',
        openStreetMaps: 'https://osm.org/uk',
      },
      flags: { svg: 'https://flagcdn.com/gb.svg' },
    },
  };

  return responses[countryName] || null;
};
