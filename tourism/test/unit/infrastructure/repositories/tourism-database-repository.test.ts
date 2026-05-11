import { UNESCOSites } from '@domain/entities/unesco-sites';
import { type DbClient } from '@infrastructure/rds';
import { makeTourismInformationRepository } from '@infrastructure/repositories/tourism-database-repository';


  jest.mock("@aws-sdk/client-dynamodb");
  jest.mock("@aws-sdk/lib-dynamodb");
  
  describe('TourismDatabaseRepository', () => {
    let repository: Awaited<ReturnType<typeof makeTourismInformationRepository>>;
    let mockDbClient: {
      queryMultipleRows: jest.Mock;
    };
  
    beforeEach(async () => {
      jest.clearAllMocks();
      mockDbClient = {
        queryMultipleRows: jest.fn(),
      };
  
      repository = await makeTourismInformationRepository({
        rdsClient: mockDbClient as unknown as DbClient,
      });
    });

  describe('getTourismInformation', () => {
    it('should return UNESCO sites for a given country', async () => {
      const mockRows = [
        {
          country_code: 'ES',
          country_name: 'Spain',
          area_name: 'Andalusia',
          site: 'Alhambra',
          description: 'A palace and fortress complex',
        },
        {
          country_code: 'ES',
          country_name: 'Spain',
          area_name: 'Catalonia',
          site: 'Sagrada Familia',
          description: 'A large unfinished church',
        },
      ];

      mockDbClient.queryMultipleRows.mockResolvedValue(
        mockRows.map(
          (row) => new UNESCOSites(row.country_code, row.country_name, row.area_name, row.site, row.description),
        ),
      );

      const result = await repository.getTourismInformation('Spain');

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(UNESCOSites);
      expect(result[0].countryName).toBe('Spain');
      expect(result[0].site).toBe('Alhambra');
      expect(result[1].site).toBe('Sagrada Familia');

      expect(mockDbClient.queryMultipleRows).toHaveBeenCalledWith({
        query: expect.stringContaining('WHERE LOWER(country_name) = LOWER($1)'),
        bindVariables: ['Spain'],
        rowMapper: expect.any(Function),
      });
    });

    it('should return empty array when no sites found', async () => {
      mockDbClient.queryMultipleRows.mockResolvedValue([]);

      const result = await repository.getTourismInformation('UnknownCountry');

      expect(result).toEqual([]);
      expect(mockDbClient.queryMultipleRows).toHaveBeenCalledWith({
        query: expect.any(String),
        bindVariables: ['UnknownCountry'],
        rowMapper: expect.any(Function),
      });
    });

    it('should handle case-insensitive country name search', async () => {
      const mockRows = [
        {
          country_code: 'FR',
          country_name: 'France',
          area_name: 'Île-de-France',
          site: 'Palace of Versailles',
          description: 'Royal château',
        },
      ];

      mockDbClient.queryMultipleRows.mockResolvedValue(
        mockRows.map(
          (row) => new UNESCOSites(row.country_code, row.country_name, row.area_name, row.site, row.description),
        ),
      );

      await repository.getTourismInformation('FRANCE');

      expect(mockDbClient.queryMultipleRows).toHaveBeenCalledWith({
        query: expect.stringContaining('LOWER(country_name) = LOWER($1)'),
        bindVariables: ['FRANCE'],
        rowMapper: expect.any(Function),
      });
    });

    it('should handle sites without description', async () => {
      const mockRows = [
        {
          country_code: 'IT',
          country_name: 'Italy',
          area_name: 'Lazio',
          site: 'Colosseum',
          description: undefined,
        },
      ];

      mockDbClient.queryMultipleRows.mockResolvedValue(
        mockRows.map(
          (row) => new UNESCOSites(row.country_code, row.country_name, row.area_name, row.site, row.description),
        ),
      );

      const result = await repository.getTourismInformation('Italy');

      expect(result).toHaveLength(1);
      expect(result[0].description).toBeUndefined();
    });

    it('should throw error when database query fails', async () => {
      mockDbClient.queryMultipleRows.mockRejectedValue(new Error('Database connection failed'));

      await expect(repository.getTourismInformation('Spain')).rejects.toThrow(
        'Failed to fetch tourism information: Database connection failed',
      );
    });

    it('should order results by site name', async () => {
      expect(mockDbClient.queryMultipleRows).toBeDefined();

      const mockRows = [
        {
          country_code: 'GB',
          country_name: 'United Kingdom',
          area_name: 'England',
          site: 'Stonehenge',
          description: 'Prehistoric monument',
        },
      ];

      mockDbClient.queryMultipleRows.mockResolvedValue(
        mockRows.map(
          (row) => new UNESCOSites(row.country_code, row.country_name, row.area_name, row.site, row.description),
        ),
      );

      await repository.getTourismInformation('United Kingdom');

      expect(mockDbClient.queryMultipleRows).toHaveBeenCalledWith({
        query: expect.stringContaining('ORDER BY site ASC'),
        bindVariables: ['United Kingdom'],
        rowMapper: expect.any(Function),
      });
    });
  });
});
