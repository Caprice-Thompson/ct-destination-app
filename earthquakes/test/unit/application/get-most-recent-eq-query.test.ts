import { getMostRecentEarthquakesQuery } from '@application/get-most-recent-eq-query';
import { Earthquake } from '@domain/entities/earthquake';
import { Coordinates } from '@domain/entities/coordinates';

describe('getMostRecentEarthquakesQuery', () => {
  let mockDependencies: any;

  beforeEach(() => {
    mockDependencies = {
      earthquakeRepository: {
        getMostRecentEarthquakes: jest.fn(),
      },
      coordinatesRepository: {
        getCoordinatesByCountryName: jest.fn(),
      },
      logger: {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful Queries', () => {
    it('should fetch coordinates and earthquakes successfully', async () => {
      const mockCoordinates = new Coordinates({ latitude: 40, longitude: -3 });
      const mockEarthquakes = [
        new Earthquake({
          name: '2 km NW of Santafé, Spain',
          magnitude: 4.3,
          date: '2021-01-28',
          type: 'earthquake',
          tsunami: 0,
        }),
      ];

      mockDependencies.coordinatesRepository.getCoordinatesByCountryName.mockResolvedValue(
        mockCoordinates
      );
      mockDependencies.earthquakeRepository.getMostRecentEarthquakes.mockResolvedValue(
        mockEarthquakes
      );

      const query = {
        countryName: 'Spain',
        startTime: '2020-01-01',
        endTime: '2023-01-01',
      };

      const result = await getMostRecentEarthquakesQuery(query, mockDependencies);

      expect(result.earthquakes).toHaveLength(1);
      expect(result.earthquakes[0].name).toBe('2 km NW of Santafé, Spain');
      expect(result.countryName).toBe('Spain');
      expect(result.coordinates.latitude).toBe(40);
      expect(result.coordinates.longitude).toBe(-3);

      expect(mockDependencies.coordinatesRepository.getCoordinatesByCountryName).toHaveBeenCalledWith(
        'Spain'
      );
      expect(mockDependencies.earthquakeRepository.getMostRecentEarthquakes).toHaveBeenCalledWith({
        latitude: 40,
        longitude: -3,
        startTime: '2020-01-01',
        endTime: '2023-01-01',
        maxRadiusKm: undefined,
        minMagnitude: undefined,
        limit: undefined,
      });
    });

    it('should pass optional parameters to earthquake repository', async () => {
      const mockCoordinates = new Coordinates({ latitude: 35, longitude: 139 });
      const mockEarthquakes: Earthquake[] = [];

      mockDependencies.coordinatesRepository.getCoordinatesByCountryName.mockResolvedValue(
        mockCoordinates
      );
      mockDependencies.earthquakeRepository.getMostRecentEarthquakes.mockResolvedValue(
        mockEarthquakes
      );

      const query = {
        countryName: 'Japan',
        startTime: '2022-01-01',
        endTime: '2023-01-01',
        maxRadiusKm: 500,
        minMagnitude: 5.0,
        limit: 20,
      };

      await getMostRecentEarthquakesQuery(query, mockDependencies);

      expect(mockDependencies.earthquakeRepository.getMostRecentEarthquakes).toHaveBeenCalledWith({
        latitude: 35,
        longitude: 139,
        startTime: '2022-01-01',
        endTime: '2023-01-01',
        maxRadiusKm: 500,
        minMagnitude: 5.0,
        limit: 20,
      });
    });

    it('should handle empty earthquake results', async () => {
      const mockCoordinates = new Coordinates({ latitude: 40, longitude: -3 });

      mockDependencies.coordinatesRepository.getCoordinatesByCountryName.mockResolvedValue(
        mockCoordinates
      );
      mockDependencies.earthquakeRepository.getMostRecentEarthquakes.mockResolvedValue([]);

      const query = {
        countryName: 'Spain',
        startTime: '2020-01-01',
        endTime: '2023-01-01',
      };

      const result = await getMostRecentEarthquakesQuery(query, mockDependencies);

      expect(result.earthquakes).toHaveLength(0);
      expect(result.countryName).toBe('Spain');
    });

    it('should log query start and completion', async () => {
      const mockCoordinates = new Coordinates({ latitude: 40, longitude: -3 });
      mockDependencies.coordinatesRepository.getCoordinatesByCountryName.mockResolvedValue(
        mockCoordinates
      );
      mockDependencies.earthquakeRepository.getMostRecentEarthquakes.mockResolvedValue([]);

      const query = {
        countryName: 'Spain',
        startTime: '2020-01-01',
        endTime: '2023-01-01',
      };

      await getMostRecentEarthquakesQuery(query, mockDependencies);

      expect(mockDependencies.logger.info).toHaveBeenCalledWith(
        'Starting get most recent earthquakes query',
        { query }
      );
      expect(mockDependencies.logger.info).toHaveBeenCalledWith(
        'Get most recent earthquakes query completed successfully',
        expect.objectContaining({
          countryName: 'Spain',
          earthquakesCount: 0,
        })
      );
    });
  });

  describe('Validation Errors', () => {
    it('should throw error for empty country name', async () => {
      const query = {
        countryName: '',
        startTime: '2020-01-01',
        endTime: '2023-01-01',
      };

      await expect(getMostRecentEarthquakesQuery(query, mockDependencies)).rejects.toThrow(
        'Validation error'
      );
    });

    it('should throw error for invalid date format', async () => {
      const query = {
        countryName: 'Spain',
        startTime: '2020/01/01',
        endTime: '2023-01-01',
      };

      await expect(getMostRecentEarthquakesQuery(query, mockDependencies)).rejects.toThrow(
        'Validation error'
      );
    });

    it('should throw error when start time is after end time', async () => {
      const query = {
        countryName: 'Spain',
        startTime: '2023-01-01',
        endTime: '2020-01-01',
      };

      await expect(getMostRecentEarthquakesQuery(query, mockDependencies)).rejects.toThrow(
        'Start time must be before end time'
      );
    });
  });

  describe('Repository Errors', () => {
    it('should propagate coordinates repository errors', async () => {
      mockDependencies.coordinatesRepository.getCoordinatesByCountryName.mockRejectedValue(
        new Error('Country not found')
      );

      const query = {
        countryName: 'InvalidCountry',
        startTime: '2020-01-01',
        endTime: '2023-01-01',
      };

      await expect(getMostRecentEarthquakesQuery(query, mockDependencies)).rejects.toThrow(
        'Country not found'
      );
    });

    it('should propagate earthquake repository errors', async () => {
      const mockCoordinates = new Coordinates({ latitude: 40, longitude: -3 });
      mockDependencies.coordinatesRepository.getCoordinatesByCountryName.mockResolvedValue(
        mockCoordinates
      );
      mockDependencies.earthquakeRepository.getMostRecentEarthquakes.mockRejectedValue(
        new Error('API error')
      );

      const query = {
        countryName: 'Spain',
        startTime: '2020-01-01',
        endTime: '2023-01-01',
      };

      await expect(getMostRecentEarthquakesQuery(query, mockDependencies)).rejects.toThrow(
        'API error'
      );
    });
  });
});

