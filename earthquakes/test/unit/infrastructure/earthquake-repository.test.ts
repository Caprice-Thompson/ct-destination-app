import { EarthquakeRepository } from '@infrastructure/repositories/earthquake-repository';
import { Earthquake } from '@domain/entities/earthquake';

describe('EarthquakeRepository', () => {
  let repository: EarthquakeRepository;
  let mockLogger: any;

  beforeEach(() => {
    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    repository = new EarthquakeRepository('https://api.example.com', mockLogger);

    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMostRecentEarthquakes', () => {
    it('should fetch and map earthquakes successfully', async () => {
      const mockResponse = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            id: 'us6000dcq4',
            properties: {
              mag: 4.3,
              place: '2 km NW of Santafé, Spain',
              time: 1611859789557,
              type: 'earthquake',
              tsunami: 0,
            },
          },
          {
            type: 'Feature',
            id: 'us7000d3it',
            properties: {
              mag: 4.3,
              place: '2 km WNW of Atarfe, Spain',
              time: 1611698095284,
              type: 'earthquake',
              tsunami: 0,
            },
          },
        ],
        metadata: {
          generated: 1768071227000,
          url: 'https://api.example.com',
          title: 'USGS Earthquakes',
          status: 200,
          count: 2,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const params = {
        latitude: 40,
        longitude: -3,
        startTime: '2020-01-01',
        endTime: '2023-01-01',
        maxRadiusKm: 300,
        limit: 10,
      };

      const result = await repository.getMostRecentEarthquakes(params);

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Earthquake);
      expect(result[0].name).toBe('2 km NW of Santafé, Spain');
      expect(result[0].magnitude).toBe(4.3);
      expect(result[0].date).toBe('2021-01-28');
      expect(result[0].type).toBe('earthquake');
      expect(result[0].tsunami).toBe(0);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Fetching earthquakes from USGS API',
        expect.objectContaining({ url: expect.stringContaining('latitude=40') })
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Earthquakes fetched successfully from USGS API',
        expect.objectContaining({ count: 2, status: 200 })
      );
    });

    it('should build URL with all parameters', async () => {
      const mockResponse = {
        type: 'FeatureCollection',
        features: [],
        metadata: { generated: 0, url: '', title: '', status: 200, count: 0 },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const params = {
        latitude: 40,
        longitude: -3,
        startTime: '2020-01-01',
        endTime: '2023-01-01',
        maxRadiusKm: 500,
        minMagnitude: 4.0,
        limit: 20,
      };

      await repository.getMostRecentEarthquakes(params);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('latitude=40')
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('longitude=-3')
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('starttime=2020-01-01')
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('endtime=2023-01-01')
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('maxradiuskm=500')
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('minmagnitude=4')
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=20')
      );
    });

    it('should use default max radius when not provided', async () => {
      const mockResponse = {
        type: 'FeatureCollection',
        features: [],
        metadata: { generated: 0, url: '', title: '', status: 200, count: 0 },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const params = {
        latitude: 40,
        longitude: -3,
        startTime: '2020-01-01',
        endTime: '2023-01-01',
      };

      await repository.getMostRecentEarthquakes(params);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('maxradiuskm=300')
      );
    });

    it('should handle empty results', async () => {
      const mockResponse = {
        type: 'FeatureCollection',
        features: [],
        metadata: { generated: 0, url: '', title: '', status: 200, count: 0 },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const params = {
        latitude: 40,
        longitude: -3,
        startTime: '2020-01-01',
        endTime: '2023-01-01',
      };

      const result = await repository.getMostRecentEarthquakes(params);

      expect(result).toHaveLength(0);
    });

    it('should throw error when API returns non-ok status', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      });

      const params = {
        latitude: 40,
        longitude: -3,
        startTime: '2020-01-01',
        endTime: '2023-01-01',
      };

      await expect(repository.getMostRecentEarthquakes(params)).rejects.toThrow(
        'Failed to fetch most recent earthquakes'
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error fetching earthquakes from USGS API',
        expect.objectContaining({
          error: expect.stringContaining('400'),
          params,
        })
      );
    });

    it('should throw error when fetch fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const params = {
        latitude: 40,
        longitude: -3,
        startTime: '2020-01-01',
        endTime: '2023-01-01',
      };

      await expect(repository.getMostRecentEarthquakes(params)).rejects.toThrow(
        'Failed to fetch most recent earthquakes: Network error'
      );

      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should correctly format date from timestamp', async () => {
      const mockResponse = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            id: 'test1',
            properties: {
              mag: 5.0,
              place: 'Test Location',
              time: 1672531200000,
              type: 'earthquake',
              tsunami: 0,
            },
          },
        ],
        metadata: { generated: 0, url: '', title: '', status: 200, count: 1 },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const params = {
        latitude: 40,
        longitude: -3,
        startTime: '2020-01-01',
        endTime: '2023-01-01',
      };

      const result = await repository.getMostRecentEarthquakes(params);

      expect(result[0].date).toBe('2023-01-01');
    });
  });
});

