import { IngestCountryData } from '@application/ingest-country-data';
import type {
  CountryApiRepositoryInterface,
  CountryDatabaseRepositoryInterface,
  PopulationApiRepositoryInterface,
} from '@application/interfaces/repositories';
import { CountryFacts, Currency, Coordinates } from '@domain/entities/country-facts';
import { CityPopulation } from '@domain/entities/city-population';

describe('IngestCountryData', () => {
  let mockCountryApiRepository: jest.Mocked<CountryApiRepositoryInterface>;
  let mockPopulationApiRepository: jest.Mocked<PopulationApiRepositoryInterface>;
  let mockCountryDatabaseRepository: jest.Mocked<CountryDatabaseRepositoryInterface>;
  let ingestCountryData: IngestCountryData;

  beforeEach(() => {
    mockCountryApiRepository = {
      getCountryFacts: jest.fn(),
    };

    mockPopulationApiRepository = {
      getTopCityPopulations: jest.fn(),
    };

    mockCountryDatabaseRepository = {
      getTopCityPopulations: jest.fn(),
      getNationalDish: jest.fn(),
      saveCityPopulation: jest.fn(),
      saveNationalDish: jest.fn(),
    };

    ingestCountryData = new IngestCountryData(
      mockCountryApiRepository,
      mockPopulationApiRepository,
      mockCountryDatabaseRepository,
    );
  });

  describe('ingestForCountry', () => {
    it('should successfully ingest population data for a country', async () => {
      const countryName = 'United States';
      const countryFacts = new CountryFacts({
        countryCode: 'US',
        countryName: 'United States',
        capitalCityName: 'Washington, D.C.',
        languages: ['English'],
        currency: new Currency('United States dollar', '$'),
        coordinates: new Coordinates(38.0, -97.0),
        flagUrl: 'https://flagcdn.com/us.svg',
        maps: { googleMaps: 'https://maps.google.com', openStreetMaps: 'https://osm.org' },
      });
      const cityPopulation = new CityPopulation({
        cityName: 'New York',
        countryCode: 'US',
        population: 8336817,
      });

      mockCountryApiRepository.getCountryFacts.mockResolvedValue(countryFacts);
      mockPopulationApiRepository.getTopCityPopulations.mockResolvedValue(cityPopulation);
      mockCountryDatabaseRepository.saveCityPopulation.mockResolvedValue();

      const result = await ingestCountryData.ingestForCountry(countryName);

      expect(result.countryName).toBe(countryName);
      expect(result.success).toBe(true);
      expect(result.populationIngested).toBe(true);
      expect(mockCountryApiRepository.getCountryFacts).toHaveBeenCalledWith(countryName);
      expect(mockPopulationApiRepository.getTopCityPopulations).toHaveBeenCalledWith(countryName);
      expect(mockCountryDatabaseRepository.saveCityPopulation).toHaveBeenCalledWith(cityPopulation, countryName);
    });

    it('should handle country not found error', async () => {
      const countryName = 'NonExistentCountry';

      mockCountryApiRepository.getCountryFacts.mockResolvedValue(null);

      const result = await ingestCountryData.ingestForCountry(countryName);

      expect(result.countryName).toBe(countryName);
      expect(result.success).toBe(false);
      expect(result.populationIngested).toBe(false);
      expect(result.errors).toContain('Country not found: NonExistentCountry');
    });

    it('should handle population API failure gracefully', async () => {
      const countryName = 'France';
      const countryFacts = new CountryFacts({
        countryCode: 'FR',
        countryName: 'France',
        capitalCityName: 'Paris',
        languages: ['French'],
        currency: new Currency('Euro', '€'),
        coordinates: new Coordinates(46.0, 2.0),
        flagUrl: 'https://flagcdn.com/fr.svg',
        maps: { googleMaps: 'https://maps.google.com', openStreetMaps: 'https://osm.org' },
      });

      mockCountryApiRepository.getCountryFacts.mockResolvedValue(countryFacts);
      mockPopulationApiRepository.getTopCityPopulations.mockRejectedValue(new Error('API rate limit exceeded'));

      const result = await ingestCountryData.ingestForCountry(countryName);

      expect(result.countryName).toBe(countryName);
      expect(result.success).toBe(false);
      expect(result.populationIngested).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors![0]).toContain('Population ingestion failed');
    });

    it('should handle no population data available', async () => {
      const countryName = 'Vatican City';
      const countryFacts = new CountryFacts({
        countryCode: 'VA',
        countryName: 'Vatican City',
        capitalCityName: 'Vatican City',
        languages: ['Italian', 'Latin'],
        currency: new Currency('Euro', '€'),
        coordinates: new Coordinates(41.9, 12.45),
        flagUrl: 'https://flagcdn.com/va.svg',
        maps: { googleMaps: 'https://maps.google.com', openStreetMaps: 'https://osm.org' },
      });

      mockCountryApiRepository.getCountryFacts.mockResolvedValue(countryFacts);
      mockPopulationApiRepository.getTopCityPopulations.mockResolvedValue(null);

      const result = await ingestCountryData.ingestForCountry(countryName);

      expect(result.countryName).toBe(countryName);
      expect(result.success).toBe(false);
      expect(result.populationIngested).toBe(false);
      expect(result.errors).toContain('No population data available');
      expect(mockCountryDatabaseRepository.saveCityPopulation).not.toHaveBeenCalled();
    });

    it('should handle database save failure', async () => {
      const countryName = 'Germany';
      const countryFacts = new CountryFacts({
        countryCode: 'DE',
        countryName: 'Germany',
        capitalCityName: 'Berlin',
        languages: ['German'],
        currency: new Currency('Euro', '€'),
        coordinates: new Coordinates(51.0, 9.0),
        flagUrl: 'https://flagcdn.com/de.svg',
        maps: { googleMaps: 'https://maps.google.com', openStreetMaps: 'https://osm.org' },
      });
      const cityPopulation = new CityPopulation({
        cityName: 'Berlin',
        countryCode: 'DE',
        population: 3769495,
      });

      mockCountryApiRepository.getCountryFacts.mockResolvedValue(countryFacts);
      mockPopulationApiRepository.getTopCityPopulations.mockResolvedValue(cityPopulation);
      mockCountryDatabaseRepository.saveCityPopulation.mockRejectedValue(new Error('Database connection failed'));

      const result = await ingestCountryData.ingestForCountry(countryName);

      expect(result.countryName).toBe(countryName);
      expect(result.success).toBe(false);
      expect(result.populationIngested).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors![0]).toContain('Population ingestion failed');
    });
  });

  describe('ingestForMultipleCountries', () => {
    it('should ingest data for multiple countries', async () => {
      const countries = ['United States', 'France', 'Germany'];
      const mockResults = countries.map((country) => ({
        countryName: country,
        success: true,
        populationIngested: true,
        nationalDishIngested: false,
      }));

      jest.spyOn(ingestCountryData, 'ingestForCountry').mockImplementation(async (countryName) => {
        const result = mockResults.find((r) => r.countryName === countryName);
        return result || mockResults[0];
      });

      const results = await ingestCountryData.ingestForMultipleCountries(countries);

      expect(results).toHaveLength(3);
      expect(results.every((r) => r.success)).toBe(true);
      expect(ingestCountryData.ingestForCountry).toHaveBeenCalledTimes(3);
    });

    it('should continue processing even if some countries fail', async () => {
      const countries = ['United States', 'InvalidCountry', 'France'];

      jest.spyOn(ingestCountryData, 'ingestForCountry').mockImplementation(async (countryName) => {
        if (countryName === 'InvalidCountry') {
          return {
            countryName,
            success: false,
            populationIngested: false,
            nationalDishIngested: false,
            errors: ['Country not found: InvalidCountry'],
          };
        }
        return {
          countryName,
          success: true,
          populationIngested: true,
          nationalDishIngested: false,
        };
      });

      const results = await ingestCountryData.ingestForMultipleCountries(countries);

      expect(results).toHaveLength(3);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[2].success).toBe(true);
    });

    it('should handle complete failure gracefully', async () => {
      const countries = ['Country1', 'Country2'];

      jest.spyOn(ingestCountryData, 'ingestForCountry').mockRejectedValue(new Error('Critical failure'));

      const results = await ingestCountryData.ingestForMultipleCountries(countries);

      expect(results).toHaveLength(2);
      expect(results.every((r) => !r.success)).toBe(true);
      expect(results.every((r) => r.errors && r.errors.length > 0)).toBe(true);
    });

    it('should process countries in parallel', async () => {
      const countries = ['US', 'FR', 'DE', 'IT', 'ES'];
      const startTime = Date.now();

      jest.spyOn(ingestCountryData, 'ingestForCountry').mockImplementation(async (countryName) => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 100));
        return {
          countryName,
          success: true,
          populationIngested: true,
          nationalDishIngested: false,
        };
      });

      await ingestCountryData.ingestForMultipleCountries(countries);
      const duration = Date.now() - startTime;

      // If processed in parallel, should take ~100ms, not 500ms
      expect(duration).toBeLessThan(300);
    });
  });
});
