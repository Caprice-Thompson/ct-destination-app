import { CountryDBRepository } from '@infrastructure/repositories/country-repository';
import { DbClient } from '@infrastructure/repositories/db/rds_client';

describe('PostgresCountryDataRepository', () => {
  let mockDbClient: jest.Mocked<DbClient>;
  let repository: CountryDBRepository;

  beforeEach(() => {
    mockDbClient = {
      querySingleRow: jest.fn(),
      querySingleRowOptional: jest.fn(),
      queryMultipleRows: jest.fn(),
      update: jest.fn(),
      closeConnection: jest.fn(),
      beginTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
    };

    repository = new CountryDBRepository(mockDbClient);
  });

  describe('getCityPopulation', () => {
    it('should return city population when found', async () => {
      const mockRow = {
        city_name: 'Madrid',
        country_code: 'ES',
        population: 3223334,
      };

      mockDbClient.querySingleRowOptional.mockResolvedValue(mockRow);

      const result = await repository.getCityPopulation('Madrid', 'ES');

      expect(result).not.toBeNull();
      expect(result?.cityName).toBe('Madrid');
      expect(result?.countryCode).toBe('ES');
      expect(result?.population).toBe(3223334);

      expect(mockDbClient.querySingleRowOptional).toHaveBeenCalledWith({
        query: expect.stringContaining('SELECT city_name, country_code, population'),
        bindVariables: ['Madrid', 'ES'],
      });
    });

    it('should return null when city is not found', async () => {
      mockDbClient.querySingleRowOptional.mockResolvedValue(null);

      const result = await repository.getCityPopulation('NonExistentCity', 'XX');

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      mockDbClient.querySingleRowOptional.mockRejectedValue(new Error('Connection failed'));

      await expect(repository.getCityPopulation('Madrid', 'ES')).rejects.toThrow(
        'Failed to fetch city population: Connection failed',
      );
    });

    it('should query with correct parameters', async () => {
      mockDbClient.querySingleRowOptional.mockResolvedValue(null);

      await repository.getCityPopulation('Paris', 'FR');

      expect(mockDbClient.querySingleRowOptional).toHaveBeenCalledWith({
        query: expect.stringContaining('city_name = $1 AND country_code = $2'),
        bindVariables: ['Paris', 'FR'],
      });
    });

    it('should handle special characters in city name', async () => {
      const mockRow = {
        city_name: 'São Paulo',
        country_code: 'BR',
        population: 12300000,
      };

      mockDbClient.querySingleRowOptional.mockResolvedValue(mockRow);

      const result = await repository.getCityPopulation('São Paulo', 'BR');

      expect(result?.cityName).toBe('São Paulo');
    });

    it('should handle zero population', async () => {
      const mockRow = {
        city_name: 'Ghost Town',
        country_code: 'XX',
        population: 0,
      };

      mockDbClient.querySingleRowOptional.mockResolvedValue(mockRow);

      const result = await repository.getCityPopulation('Ghost Town', 'XX');

      expect(result?.population).toBe(0);
    });
  });

  describe('getNationalDish', () => {
    it('should return national dish when found', async () => {
      const mockRow = {
        country_code: 'ES',
        dish_name: 'Paella',
        description: 'A traditional Spanish rice dish',
      };

      mockDbClient.querySingleRowOptional.mockResolvedValue(mockRow);

      const result = await repository.getNationalDish('ES');

      expect(result).not.toBeNull();
      expect(result?.countryCode).toBe('ES');
      expect(result?.dishName).toBe('Paella');
      expect(result?.description).toBe('A traditional Spanish rice dish');

      expect(mockDbClient.querySingleRowOptional).toHaveBeenCalledWith({
        query: expect.stringContaining('SELECT country_code, dish_name, description'),
        bindVariables: ['ES'],
      });
    });

    it('should return null when national dish is not found', async () => {
      mockDbClient.querySingleRowOptional.mockResolvedValue(null);

      const result = await repository.getNationalDish('XX');

      expect(result).toBeNull();
    });

    it('should handle null description', async () => {
      const mockRow = {
        country_code: 'FR',
        dish_name: 'Pot-au-feu',
        description: null,
      };

      mockDbClient.querySingleRowOptional.mockResolvedValue(mockRow);

      const result = await repository.getNationalDish('FR');

      expect(result).not.toBeNull();
      expect(result?.dishName).toBe('Pot-au-feu');
      expect(result?.description).toBeUndefined();
    });

    it('should handle empty string description', async () => {
      const mockRow = {
        country_code: 'IT',
        dish_name: 'Pizza',
        description: '',
      };

      mockDbClient.querySingleRowOptional.mockResolvedValue(mockRow);

      const result = await repository.getNationalDish('IT');

      // Empty string is converted to undefined by the repository (|| undefined)
      expect(result?.description).toBeUndefined();
    });

    it('should handle database errors', async () => {
      mockDbClient.querySingleRowOptional.mockRejectedValue(new Error('Query timeout'));

      await expect(repository.getNationalDish('ES')).rejects.toThrow('Failed to fetch national dish: Query timeout');
    });

    it('should query with correct parameters', async () => {
      mockDbClient.querySingleRowOptional.mockResolvedValue(null);

      await repository.getNationalDish('GB');

      expect(mockDbClient.querySingleRowOptional).toHaveBeenCalledWith({
        query: expect.stringContaining('country_code = $1'),
        bindVariables: ['GB'],
      });
    });

    it('should handle special characters in dish name', async () => {
      const mockRow = {
        country_code: 'FR',
        dish_name: 'Crème brûlée',
        description: 'A French dessert',
      };

      mockDbClient.querySingleRowOptional.mockResolvedValue(mockRow);

      const result = await repository.getNationalDish('FR');

      expect(result?.dishName).toBe('Crème brûlée');
    });
  });
});
