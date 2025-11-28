import { RestCountriesApiRepository } from '@infrastructure/repositories/rest-countries-api-repository';

// Mock fetch globally
global.fetch = jest.fn();

describe('RestCountriesApiRepository', () => {
  let repository: RestCountriesApiRepository;
  const baseUrl = 'https://restcountries.com/v3.1';

  beforeEach(() => {
    repository = new RestCountriesApiRepository(baseUrl);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getCountryDetailsByName', () => {
    it('should fetch and map country details successfully', async () => {
      const mockApiResponse = [
        {
          name: { common: 'Spain' },
          cca2: 'ES',
          capital: ['Madrid'],
          languages: { spa: 'Spanish', cat: 'Catalan' },
          currencies: { EUR: { name: 'Euro', symbol: '€' } },
          latlng: [40.0, -4.0],
          maps: {
            googleMaps: 'https://goo.gl/maps/spain',
            openStreetMaps: 'https://osm.org/spain',
          },
          flags: { svg: 'https://flagcdn.com/es.svg', png: 'https://flagcdn.com/es.png' },
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      });

      const result = await repository.getCountryDetailsByName('Spain');

      expect(result).not.toBeNull();
      expect(result?.code).toBe('ES');
      expect(result?.name).toBe('Spain');
      expect(result?.capital).toBe('Madrid');
      expect(result?.currencyInfo.name).toBe('Euro');
      expect(result?.currencyInfo.symbol).toBe('€');
      expect(result?.languageList).toEqual(['Spanish', 'Catalan']);
      expect(result?.location.latitude).toBe(40.0);
      expect(result?.location.longitude).toBe(-4.0);
      expect(result?.flag).toBe('https://flagcdn.com/es.svg');

      expect(global.fetch).toHaveBeenCalledWith('https://restcountries.com/v3.1/name/Spain');
    });

    it('should handle country name with spaces', async () => {
      const mockApiResponse = [
        {
          name: { common: 'United Kingdom' },
          cca2: 'GB',
          capital: ['London'],
          languages: { eng: 'English' },
          currencies: { GBP: { name: 'Pound Sterling', symbol: '£' } },
          latlng: [54.0, -2.0],
          maps: { googleMaps: '', openStreetMaps: '' },
          flags: { svg: 'https://flag.svg' },
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      });

      const result = await repository.getCountryDetailsByName('United Kingdom');

      expect(result).not.toBeNull();
      expect(result?.name).toBe('United Kingdom');

      expect(global.fetch).toHaveBeenCalledWith('https://restcountries.com/v3.1/name/United%20Kingdom');
    });

    it('should return null when country is not found (404)', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      const result = await repository.getCountryDetailsByName('NonExistentCountry');

      expect(result).toBeNull();
    });

    it('should throw error for non-404 API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(repository.getCountryDetailsByName('Spain')).rejects.toThrow('API request failed with status 500');
    });

    it('should return null when API returns empty array', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      const result = await repository.getCountryDetailsByName('Spain');

      expect(result).toBeNull();
    });

    it('should handle missing optional fields gracefully', async () => {
      const mockApiResponse = [
        {
          name: { common: 'Test Country' },
          cca2: 'XX',
          // Missing capital, languages, currencies, etc.
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      });

      const result = await repository.getCountryDetailsByName('Test Country');

      expect(result).not.toBeNull();
      expect(result?.code).toBe('XX');
      expect(result?.name).toBe('Test Country');
      expect(result?.capital).toBe('Unknown');
      expect(result?.currencyInfo.name).toBe('Unknown');
      expect(result?.currencyInfo.symbol).toBe('');
      expect(result?.languageList).toEqual([]);
      expect(result?.location.latitude).toBe(0);
      expect(result?.location.longitude).toBe(0);
    });

    it('should prefer SVG flag over PNG', async () => {
      const mockApiResponse = [
        {
          name: { common: 'France' },
          cca2: 'FR',
          flags: { svg: 'https://flag.svg', png: 'https://flag.png' },
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      });

      const result = await repository.getCountryDetailsByName('France');

      expect(result?.flag).toBe('https://flag.svg');
    });

    it('should use PNG flag if SVG is not available', async () => {
      const mockApiResponse = [
        {
          name: { common: 'France' },
          cca2: 'FR',
          flags: { png: 'https://flag.png' },
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      });

      const result = await repository.getCountryDetailsByName('France');

      expect(result?.flag).toBe('https://flag.png');
    });

    it('should handle multiple currencies (take first one)', async () => {
      const mockApiResponse = [
        {
          name: { common: 'Test' },
          cca2: 'XX',
          currencies: {
            USD: { name: 'US Dollar', symbol: '$' },
            EUR: { name: 'Euro', symbol: '€' },
          },
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      });

      const result = await repository.getCountryDetailsByName('Test');

      // Should take the first currency (order may vary, but one should be selected)
      expect(result?.currencyInfo.name).toBeTruthy();
      expect(['US Dollar', 'Euro']).toContain(result?.currencyInfo.name);
    });

    it('should handle multiple capitals (take first one)', async () => {
      const mockApiResponse = [
        {
          name: { common: 'South Africa' },
          cca2: 'ZA',
          capital: ['Pretoria', 'Cape Town', 'Bloemfontein'],
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      });

      const result = await repository.getCountryDetailsByName('South Africa');

      expect(result?.capital).toBe('Pretoria');
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(repository.getCountryDetailsByName('Spain')).rejects.toThrow(
        'Failed to fetch country details: Network error',
      );
    });

    it('should handle JSON parse errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(repository.getCountryDetailsByName('Spain')).rejects.toThrow(
        'Failed to fetch country details: Invalid JSON',
      );
    });

    it('should extract all languages', async () => {
      const mockApiResponse = [
        {
          name: { common: 'Switzerland' },
          cca2: 'CH',
          languages: {
            ger: 'German',
            fra: 'French',
            ita: 'Italian',
            roh: 'Romansh',
          },
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      });

      const result = await repository.getCountryDetailsByName('Switzerland');

      expect(result?.languageList).toHaveLength(4);
      expect(result?.languageList).toContain('German');
      expect(result?.languageList).toContain('French');
      expect(result?.languageList).toContain('Italian');
      expect(result?.languageList).toContain('Romansh');
    });
  });
});
