import { ListCountryInformation } from '@application/list-country-information';
import {
  CountryApiRepositoryInterface,
  CountryDatabaseRepositoryInterface,
} from '@application/interfaces/repositories';
import { CountryFacts, Currency, Coordinates, MapDetails } from '@domain/entities/country-detail';
import { CityPopulation } from '@domain/entities/city-population';
import { NationalDish } from '@domain/entities/national-dish';

describe('ListCountryInformationUseCase', () => {
  let mockApiRepository: jest.Mocked<CountryApiRepositoryInterface>;
  let mockDataRepository: jest.Mocked<CountryDatabaseRepositoryInterface>;
  let useCase: ListCountryInformation;

  beforeEach(() => {
    mockApiRepository = {
      getCountryDetailsByName: jest.fn(),
    };

    mockDataRepository = {
      getTopCityPopulations: jest.fn(),
      getNationalDish: jest.fn(),
    };

    useCase = new ListCountryInformation(mockApiRepository, mockDataRepository);
  });

  describe('Successful Execution', () => {
    it('should return complete country information when all data is available', async () => {
      const mockCountry = new CountryFacts({
        countryCode: 'ES',
        countryName: 'Spain',
        capitalCityName: 'Madrid',
        flagUrl: 'https://flagcdn.com/es.svg',
        languages: ['Spanish', 'Catalan'],
        currency: new Currency('Euro', '€'),
        coordinates: new Coordinates(40.0, -4.0),
        maps: new MapDetails('https://google.com', 'https://osm.org'),
      });

      const mockPopulation = new CityPopulation({ cityName: 'Madrid', countryCode: 'ES', population: 3223334 });
      const mockDish = new NationalDish('ES', 'Paella', null, 'A rice dish');

      mockApiRepository.getCountryDetailsByName.mockResolvedValue(mockCountry);
      mockDataRepository.getTopCityPopulations.mockResolvedValue(mockPopulation);
      mockDataRepository.getNationalDish.mockResolvedValue(mockDish);

      const result = await useCase.listCountryInfo('Spain');
      expect(result.countryDetails).toEqual(mockCountry.toJSON());
      expect(result.capitalPopulation).toEqual(mockPopulation);
      expect(result.nationalDish).toEqual(mockDish.toJSON());

      expect(mockApiRepository.getCountryDetailsByName).toHaveBeenCalledWith('Spain');
      expect(mockDataRepository.getTopCityPopulations).toHaveBeenCalledWith('Spain');
      expect(mockDataRepository.getNationalDish).toHaveBeenCalledWith('Spain');
    });

    it('should return null for population when not found in database', async () => {
      const mockCountry = new CountryFacts({
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
      mockDataRepository.getTopCityPopulations.mockResolvedValue(null);
      mockDataRepository.getNationalDish.mockResolvedValue(null);

      const result = await useCase.listCountryInfo('Test Country');

      expect(result.countryDetails).toEqual(mockCountry.toJSON());
      expect(result.capitalPopulation).toBeUndefined();
      expect(result.nationalDish).toBeUndefined();
    });

    it('should call database queries in parallel', async () => {
      const mockCountry = new CountryFacts({
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
      mockDataRepository.getTopCityPopulations.mockResolvedValue(null);
      mockDataRepository.getNationalDish.mockResolvedValue(null);

      const startTime = Date.now();
      await useCase.listCountryInfo('France');
      const duration = Date.now() - startTime;

      expect(mockDataRepository.getTopCityPopulations).toHaveBeenCalled();
      expect(mockDataRepository.getNationalDish).toHaveBeenCalled();

      expect(duration).toBeLessThan(100);
    });
  });

  describe('Error Handling', () => {
    it('should throw error when country is not found', async () => {
      mockApiRepository.getCountryDetailsByName.mockResolvedValue(null);

      await expect(useCase.listCountryInfo('NonExistentCountry')).rejects.toThrow(
        'Country not found: NonExistentCountry',
      );

      expect(mockDataRepository.getTopCityPopulations).not.toHaveBeenCalled();
      expect(mockDataRepository.getNationalDish).not.toHaveBeenCalled();
    });

    it('should propagate API repository errors', async () => {
      mockApiRepository.getCountryDetailsByName.mockRejectedValue(new Error('API connection failed'));

      await expect(useCase.listCountryInfo('Spain')).rejects.toThrow('API connection failed');
    });

    it('should propagate database errors from getCityPopulation', async () => {
      const mockCountry = new CountryFacts({
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
      mockDataRepository.getTopCityPopulations.mockRejectedValue(new Error('Database error'));
      mockDataRepository.getNationalDish.mockResolvedValue(null);

      await expect(useCase.listCountryInfo('Spain')).rejects.toThrow('Database error');
    });

    it('should propagate database errors from getNationalDish', async () => {
      const mockCountry = new CountryFacts({
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
      mockDataRepository.getTopCityPopulations.mockResolvedValue(null);
      mockDataRepository.getNationalDish.mockRejectedValue(new Error('Database error'));

      await expect(useCase.listCountryInfo('Spain')).rejects.toThrow('Database error');
    });
  });

  describe('Edge Cases', () => {
    it('should handle country with multiple languages', async () => {
      const mockCountry = new CountryFacts({
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
      mockDataRepository.getTopCityPopulations.mockResolvedValue(null);
      mockDataRepository.getNationalDish.mockResolvedValue(null);

      const result = await useCase.listCountryInfo('Switzerland');

      expect(result.countryDetails?.languages).toHaveLength(4);
    });
  });
});
