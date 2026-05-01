<<<<<<< Updated upstream
import { GetTourismInformation } from '@application/get-tourism-information';
import { TourismInformationRepositoryInterface } from '@application/interfaces/tourism-repo';
import { UNESCOSites } from '@domain/entities/unesco-sites';
=======
import { GetTourismInformation } from "@application/get-tourism-info/get-tourism-information";
import type { TourismInformationRepositoryInterface } from "@application/interfaces/tourism-repo";
import { UNESCOSites } from "@domain/entities/unesco-sites";
>>>>>>> Stashed changes

describe('GetTourismInformation Use Case Integration Tests', () => {
  let mockRepository: jest.Mocked<TourismInformationRepositoryInterface>;
  let useCase: GetTourismInformation;

  beforeEach(() => {
    mockRepository = {
      getTourismInformation: jest.fn(),
    };

    useCase = new GetTourismInformation(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful Data Retrieval', () => {
    it('should retrieve and format tourism information for a country', async () => {
      const mockSites = [
        new UNESCOSites('ES', 'Spain', 'Andalusia', 'Alhambra', 'A palace and fortress complex'),
        new UNESCOSites('ES', 'Spain', 'Catalonia', 'Sagrada Familia', 'A large unfinished church'),
        new UNESCOSites('ES', 'Spain', 'Madrid', 'El Escorial', 'Historical residence'),
      ];

      mockRepository.getTourismInformation.mockResolvedValue(mockSites);

      const result = await useCase.getTourismInfo('Spain');

      expect(result.unescoSites).toHaveLength(3);
      expect(result.unescoSites[0]).toEqual({
        countryCode: 'ES',
        countryName: 'Spain',
        areaName: 'Andalusia',
        site: 'Alhambra',
        description: 'A palace and fortress complex',
      });
      expect(mockRepository.getTourismInformation).toHaveBeenCalledWith('Spain');
      expect(mockRepository.getTourismInformation).toHaveBeenCalledTimes(1);
    });

    it('should handle empty results gracefully', async () => {
      mockRepository.getTourismInformation.mockResolvedValue([]);

      const result = await useCase.getTourismInfo('UnknownCountry');

      expect(result.unescoSites).toEqual([]);
      expect(mockRepository.getTourismInformation).toHaveBeenCalledWith('UnknownCountry');
    });

    it('should handle sites without descriptions', async () => {
      const mockSites = [
        new UNESCOSites('IT', 'Italy', 'Lazio', 'Colosseum', undefined),
        new UNESCOSites('IT', 'Italy', 'Tuscany', 'Leaning Tower of Pisa', 'Freestanding bell tower'),
      ];

      mockRepository.getTourismInformation.mockResolvedValue(mockSites);

      const result = await useCase.getTourismInfo('Italy');

      expect(result.unescoSites).toHaveLength(2);
      expect(result.unescoSites[0].description).toBeUndefined();
      expect(result.unescoSites[1].description).toBe('Freestanding bell tower');
    });

    it('should preserve all site information in the response', async () => {
      const mockSites = [
        new UNESCOSites(
          'FR',
          'France',
          'Île-de-France',
          'Palace of Versailles',
          'Former royal residence with extensive gardens',
        ),
      ];

      mockRepository.getTourismInformation.mockResolvedValue(mockSites);

      const result = await useCase.getTourismInfo('France');

      expect(result.unescoSites[0].countryCode).toBe('FR');
      expect(result.unescoSites[0].countryName).toBe('France');
      expect(result.unescoSites[0].areaName).toBe('Île-de-France');
      expect(result.unescoSites[0].site).toBe('Palace of Versailles');
      expect(result.unescoSites[0].description).toBe('Former royal residence with extensive gardens');
    });
  });

  describe('Error Handling', () => {
    it('should propagate repository errors', async () => {
      mockRepository.getTourismInformation.mockRejectedValue(new Error('Database connection failed'));

      await expect(useCase.getTourismInfo('Spain')).rejects.toThrow('Database connection failed');
      expect(mockRepository.getTourismInformation).toHaveBeenCalledWith('Spain');
    });

    it('should propagate database timeout errors', async () => {
      mockRepository.getTourismInformation.mockRejectedValue(new Error('Query timeout'));

      await expect(useCase.getTourismInfo('France')).rejects.toThrow('Query timeout');
    });

    it('should propagate authentication errors', async () => {
      mockRepository.getTourismInformation.mockRejectedValue(new Error('Authentication failed'));

      await expect(useCase.getTourismInfo('Italy')).rejects.toThrow('Authentication failed');
    });
  });

  describe('Data Transformation', () => {
    it('should correctly transform UNESCOSites entities to JSON', async () => {
      const mockSites = [new UNESCOSites('GB', 'United Kingdom', 'England', 'Stonehenge', 'Prehistoric monument')];

      mockRepository.getTourismInformation.mockResolvedValue(mockSites);

      const result = await useCase.getTourismInfo('United Kingdom');

      expect(result.unescoSites[0]).toEqual({
        countryCode: 'GB',
        countryName: 'United Kingdom',
        areaName: 'England',
        site: 'Stonehenge',
        description: 'Prehistoric monument',
      });
    });

    it('should handle multiple sites from different areas', async () => {
      const mockSites = [
        new UNESCOSites('EG', 'Egypt', 'Giza', 'Pyramids of Giza', 'Ancient pyramids'),
        new UNESCOSites('EG', 'Egypt', 'Luxor', 'Valley of the Kings', 'Royal tombs'),
        new UNESCOSites('EG', 'Egypt', 'Cairo', 'Islamic Cairo', 'Historic district'),
      ];

      mockRepository.getTourismInformation.mockResolvedValue(mockSites);

      const result = await useCase.getTourismInfo('Egypt');

      expect(result.unescoSites).toHaveLength(3);
      expect(result.unescoSites.map((s) => s.areaName)).toEqual(['Giza', 'Luxor', 'Cairo']);
    });
  });

  describe('Special Characters and International Names', () => {
    it('should handle country names with special characters', async () => {
      const mockSites = [new UNESCOSites('CI', "Côte d'Ivoire", 'Abidjan', 'Test Site', 'Description')];

      mockRepository.getTourismInformation.mockResolvedValue(mockSites);

      const result = await useCase.getTourismInfo("Côte d'Ivoire");

      expect(result.unescoSites[0].countryName).toBe("Côte d'Ivoire");
      expect(mockRepository.getTourismInformation).toHaveBeenCalledWith("Côte d'Ivoire");
    });

    it('should handle site names with special characters', async () => {
      const mockSites = [
        new UNESCOSites('DE', 'Germany', 'Bavaria', 'Würzburg Residence', 'Baroque palace with gardens'),
      ];

      mockRepository.getTourismInformation.mockResolvedValue(mockSites);

      const result = await useCase.getTourismInfo('Germany');

      expect(result.unescoSites[0].site).toBe('Würzburg Residence');
    });

    it('should handle descriptions with special characters', async () => {
      const mockSites = [
        new UNESCOSites('FR', 'France', 'Normandy', 'Mont-Saint-Michel', 'Island commune with medieval abbey'),
      ];

      mockRepository.getTourismInformation.mockResolvedValue(mockSites);

      const result = await useCase.getTourismInfo('France');

      expect(result.unescoSites[0].site).toBe('Mont-Saint-Michel');
    });
  });

  describe('Large Datasets', () => {
    it('should handle countries with many UNESCO sites', async () => {
      const mockSites = Array.from(
        { length: 50 },
        (_, i) => new UNESCOSites('IT', 'Italy', `Region ${i}`, `Site ${i}`, `Description ${i}`),
      );

      mockRepository.getTourismInformation.mockResolvedValue(mockSites);

      const result = await useCase.getTourismInfo('Italy');

      expect(result.unescoSites).toHaveLength(50);
      expect(result.unescoSites[0].site).toBe('Site 0');
      expect(result.unescoSites[49].site).toBe('Site 49');
    });

    it('should handle very long descriptions', async () => {
      const longDescription = 'A'.repeat(1000);
      const mockSites = [new UNESCOSites('CN', 'China', 'Beijing', 'Great Wall', longDescription)];

      mockRepository.getTourismInformation.mockResolvedValue(mockSites);

      const result = await useCase.getTourismInfo('China');

      expect(result.unescoSites[0].description).toBe(longDescription);
      expect(result.unescoSites[0].description?.length).toBe(1000);
    });
  });

  describe('Null and Undefined Handling', () => {
    it('should handle null response from repository', async () => {
      mockRepository.getTourismInformation.mockResolvedValue(null as any);

      const result = await useCase.getTourismInfo('SomeCountry');

      expect(result.unescoSites).toEqual([]);
    });

    it('should handle undefined response from repository', async () => {
      mockRepository.getTourismInformation.mockResolvedValue(undefined as any);

      const result = await useCase.getTourismInfo('SomeCountry');

      expect(result.unescoSites).toEqual([]);
    });
  });

  describe('Case Sensitivity', () => {
    it('should pass country name as provided to repository', async () => {
      mockRepository.getTourismInformation.mockResolvedValue([]);

      await useCase.getTourismInfo('SPAIN');

      expect(mockRepository.getTourismInformation).toHaveBeenCalledWith('SPAIN');
    });

    it('should pass lowercase country name to repository', async () => {
      mockRepository.getTourismInformation.mockResolvedValue([]);

      await useCase.getTourismInfo('spain');

      expect(mockRepository.getTourismInformation).toHaveBeenCalledWith('spain');
    });

    it('should pass mixed case country name to repository', async () => {
      mockRepository.getTourismInformation.mockResolvedValue([]);

      await useCase.getTourismInfo('SpAiN');

      expect(mockRepository.getTourismInformation).toHaveBeenCalledWith('SpAiN');
    });
  });
});
