import { getTourismInfo } from '@application/get-tourism-info/get-tourism-information';
import type { TourismInformationRepositoryInterface } from '@application/interfaces/tourism-repo';
import { UNESCOSites } from '@domain/entities/unesco-sites';
import { Dependencies } from '@infrastructure/dependencies';
import { mockDeep } from 'jest-mock-extended';

describe('GetTourismInformation', () => {
  let mockRepository: jest.Mocked<TourismInformationRepositoryInterface>;
  let dependencies: Dependencies;
  beforeEach(() => {
    mockRepository = {
      getTourismInformation: jest.fn(),
    };
    dependencies = mockDeep<Dependencies>();
  });

  describe('getTourismInfo', () => {
    it.only('should return tourism information when sites are found', async () => {
      const mockSites = [
        new UNESCOSites('ES', 'Spain', 'Andalusia', 'Alhambra', 'A palace and fortress complex'),
        new UNESCOSites('ES', 'Spain', 'Catalonia', 'Sagrada Familia', 'A large unfinished church'),
      ];

      mockRepository.getTourismInformation.mockResolvedValue(mockSites);
      const result = await getTourismInfo({ countryName: 'Spain' }, dependencies);

      expect(result.unescoSites).toHaveLength(2);
      expect(result.unescoSites[0]).toEqual({
        countryCode: 'ES',
        countryName: 'Spain',
        areaName: 'Andalusia',
        site: 'Alhambra',
        description: 'A palace and fortress complex',
      });
      expect(result.unescoSites[1]).toEqual({
        countryCode: 'ES',
        countryName: 'Spain',
        areaName: 'Catalonia',
        site: 'Sagrada Familia',
        description: 'A large unfinished church',
      });

      expect(mockRepository.getTourismInformation).toHaveBeenCalledWith('Spain');
    });

    it('should return empty array when no sites are found', async () => {
      mockRepository.getTourismInformation.mockResolvedValue([]);

      const result = await getTourismInfo({ countryName: 'UnknownCountry' }, dependencies);

      expect(result.unescoSites).toEqual([]);
      expect(mockRepository.getTourismInformation).toHaveBeenCalledWith('UnknownCountry');
    });

    it('should return empty array when repository returns null', async () => {
      mockRepository.getTourismInformation.mockResolvedValue(null as unknown as UNESCOSites[]);

      const result = await getTourismInfo({ countryName: 'SomeCountry' }, dependencies);

      expect(result.unescoSites).toEqual([]);
    });

    it('should handle sites without description', async () => {
      const mockSites = [new UNESCOSites('IT', 'Italy', 'Lazio', 'Colosseum', undefined)];

      mockRepository.getTourismInformation.mockResolvedValue(mockSites);

      const result = await getTourismInfo({ countryName: 'Italy' }, dependencies);

      expect(result.unescoSites).toHaveLength(1);
      expect(result.unescoSites[0].description).toBeUndefined();
    });

    it('should propagate repository errors', async () => {
      mockRepository.getTourismInformation.mockRejectedValue(new Error('Database connection failed'));

      await expect(getTourismInfo({ countryName: 'Spain' }, dependencies)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle multiple sites from same country', async () => {
      const mockSites = [
        new UNESCOSites('FR', 'France', 'Île-de-France', 'Palace of Versailles', 'Royal château'),
        new UNESCOSites('FR', 'France', 'Île-de-France', 'Notre-Dame Cathedral', 'Gothic cathedral'),
        new UNESCOSites('FR', 'France', 'Provence', 'Pont du Gard', 'Ancient Roman aqueduct'),
      ];

      mockRepository.getTourismInformation.mockResolvedValue(mockSites);

      const result = await getTourismInfo({ countryName: 'France' }, dependencies);

      expect(result.unescoSites).toHaveLength(3);
      expect(result.unescoSites.every((site) => site.countryName === 'France')).toBe(true);
    });

    it('should handle special characters in country names', async () => {
      const mockSites = [new UNESCOSites('CI', "Côte d'Ivoire", 'Abidjan', 'Test Site', 'Description')];

      mockRepository.getTourismInformation.mockResolvedValue(mockSites);

      const result = await getTourismInfo({ countryName: "Côte d'Ivoire" }, dependencies);

      expect(result.unescoSites).toHaveLength(1);
      expect(result.unescoSites[0].countryName).toBe("Côte d'Ivoire");
    });
  });
});
