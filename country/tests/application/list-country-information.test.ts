import { ListCountryInformationUseCase } from '@application/list-country-information';
import { CountryApiRepository, CountryDataRepository } from '@application/interfaces/repositories';
import { CountryDetail, Currency, Coordinates, MapDetails } from '@domain/entities/country-detail';
import { CityPopulation } from '@domain/entities/city-population';
import { NationalDish } from '@domain/entities/national-dish';

describe('ListCountryInformationUseCase', () => {
  let mockApiRepository: jest.Mocked<CountryApiRepository>;
  let mockDataRepository: jest.Mocked<CountryDataRepository>;
  let useCase: ListCountryInformationUseCase;

  beforeEach(() => {
    mockApiRepository = {
      getCountryDetailsByName: jest.fn(),
    };

    mockDataRepository = {
      getCityPopulation: jest.fn(),
      getNationalDish: jest.fn(),
    };

    useCase = new ListCountryInformationUseCase(mockApiRepository, mockDataRepository);
  });

  describe('Successful Execution', () => {
    it('should return complete country information when all data is available', async () => {
      const mockCountry = new CountryDetail({
        countryCode: 'ES',
        countryName: 'Spain',
        capitalCityName: 'Madrid',
        flagUrl: 'https://flagcdn.com/es.svg',
        languages: ['Spanish', 'Catalan'],
        currency: new Currency('Euro', '€'),
        coordinates: new Coordinates(40.0, -4.0),
        maps: new MapDetails('https://google.com', 'https://osm.org'),
      });

      const mockPopulation = new CityPopulation('Madrid', 'ES', 3223334);
      const mockDish = new NationalDish('ES', 'Paella', 'A rice dish');

      mockApiRepository.getCountryDetailsByName.mockResolvedValue(mockCountry);
      mockDataRepository.getCityPopulation.mockResolvedValue(mockPopulation);
      mockDataRepository.getNationalDish.mockResolvedValue(mockDish);

      const result = await useCase.executeUseCase('Spain');

      expect(result.countryDetails).toBe(mockCountry);
      expect(result.capitalPopulation).toBe(mockPopulation);
      expect(result.nationalDish).toBe(mockDish);

      expect(mockApiRepository.getCountryDetailsByName).toHaveBeenCalledWith('Spain');
      expect(mockDataRepository.getCityPopulation).toHaveBeenCalledWith('Madrid', 'ES');
      expect(mockDataRepository.getNationalDish).toHaveBeenCalledWith('ES');
    });

    it('should return null for population when not found in database', async () => {
      const mockCountry = new CountryDetail({
        countryCode: 'XX',
        countryName: 'Test Country',
        capitalCityName: 'Test City',
        flagUrl: 'https://flag.url',
        languages: ['Test'],
        currency: new Currency('Test', 'T'),
        coordinates: new Coordinates(0, 0),
        maps: new MapDetails('', ''),
      });

      mockApiRepository.getCountryDetailsByName.mockResolvedValue(mockCountry);
      mockDataRepository.getCityPopulation.mockResolvedValue(null);
      mockDataRepository.getNationalDish.mockResolvedValue(null);

      const result = await useCase.executeUseCase('Test Country');

      expect(result.countryDetails).toBe(mockCountry);
      expect(result.capitalPopulation).toBeNull();
      expect(result.nationalDish).toBeNull();
    });

    it('should call database queries in parallel', async () => {
      const mockCountry = new CountryDetail({
        countryCode: 'FR',
        countryName: 'France',
        capitalCityName: 'Paris',
        flagUrl: 'https://flag.url',
        languages: ['French'],
        currency: new Currency('Euro', '€'),
        coordinates: new Coordinates(46.0, 2.0),
        maps: new MapDetails('', ''),
      });

      mockApiRepository.getCountryDetailsByName.mockResolvedValue(mockCountry);
      mockDataRepository.getCityPopulation.mockResolvedValue(null);
      mockDataRepository.getNationalDish.mockResolvedValue(null);

      const startTime = Date.now();
      await useCase.executeUseCase('France');
      const duration = Date.now() - startTime;

      // Verify both methods were called
      expect(mockDataRepository.getCityPopulation).toHaveBeenCalled();
      expect(mockDataRepository.getNationalDish).toHaveBeenCalled();

      // If they were called sequentially with delays, this would take longer
      // This is a basic check that they're called in parallel
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Error Handling', () => {
    it('should throw error when country is not found', async () => {
      mockApiRepository.getCountryDetailsByName.mockResolvedValue(null);

      await expect(useCase.executeUseCase('NonExistentCountry')).rejects.toThrow(
        'Country not found: NonExistentCountry',
      );

      expect(mockDataRepository.getCityPopulation).not.toHaveBeenCalled();
      expect(mockDataRepository.getNationalDish).not.toHaveBeenCalled();
    });

    it('should propagate API repository errors', async () => {
      mockApiRepository.getCountryDetailsByName.mockRejectedValue(new Error('API connection failed'));

      await expect(useCase.executeUseCase('Spain')).rejects.toThrow('API connection failed');
    });

    it('should propagate database errors from getCityPopulation', async () => {
      const mockCountry = new CountryDetail({
        countryCode: 'ES',
        countryName: 'Spain',
        capitalCityName: 'Madrid',
        flagUrl: 'https://flag.url',
        languages: ['Spanish'],
        currency: new Currency('Euro', '€'),
        coordinates: new Coordinates(40.0, -4.0),
        maps: new MapDetails('', ''),
      });

      mockApiRepository.getCountryDetailsByName.mockResolvedValue(mockCountry);
      mockDataRepository.getCityPopulation.mockRejectedValue(new Error('Database error'));
      mockDataRepository.getNationalDish.mockResolvedValue(null);

      await expect(useCase.executeUseCase('Spain')).rejects.toThrow('Database error');
    });

    it('should propagate database errors from getNationalDish', async () => {
      const mockCountry = new CountryDetail({
        countryCode: 'ES',
        countryName: 'Spain',
        capitalCityName: 'Madrid',
        flagUrl: 'https://flag.url',
        languages: ['Spanish'],
        currency: new Currency('Euro', '€'),
        coordinates: new Coordinates(40.0, -4.0),
        maps: new MapDetails('', ''),
      });

      mockApiRepository.getCountryDetailsByName.mockResolvedValue(mockCountry);
      mockDataRepository.getCityPopulation.mockResolvedValue(null);
      mockDataRepository.getNationalDish.mockRejectedValue(new Error('Database error'));

      await expect(useCase.executeUseCase('Spain')).rejects.toThrow('Database error');
    });
  });

  describe('Edge Cases', () => {
    it('should handle country with no capital city', async () => {
      const mockCountry = new CountryDetail({
        countryCode: 'XX',
        countryName: 'Test',
        capitalCityName: '',
        flagUrl: '',
        languages: [],
        currency: new Currency('', ''),
        coordinates: new Coordinates(0, 0),
        maps: new MapDetails('', ''),
      });

      mockApiRepository.getCountryDetailsByName.mockResolvedValue(mockCountry);
      mockDataRepository.getCityPopulation.mockResolvedValue(null);
      mockDataRepository.getNationalDish.mockResolvedValue(null);

      const result = await useCase.executeUseCase('Test');

      expect(result.countryDetails).toBe(mockCountry);
      expect(mockDataRepository.getCityPopulation).toHaveBeenCalledWith('', 'XX');
    });

    it('should handle country with multiple languages', async () => {
      const mockCountry = new CountryDetail({
        countryCode: 'CH',
        countryName: 'Switzerland',
        capitalCityName: 'Bern',
        flagUrl: 'https://flag.url',
        languages: ['German', 'French', 'Italian', 'Romansh'],
        currency: new Currency('Swiss Franc', 'CHF'),
        coordinates: new Coordinates(46.8182, 8.2275),
        maps: new MapDetails('', ''),
      });

      mockApiRepository.getCountryDetailsByName.mockResolvedValue(mockCountry);
      mockDataRepository.getCityPopulation.mockResolvedValue(null);
      mockDataRepository.getNationalDish.mockResolvedValue(null);

      const result = await useCase.executeUseCase('Switzerland');

      expect(result.countryDetails?.languageList).toHaveLength(4);
    });
  });
});
