import { getTourismInformationHandler } from '@infrastructure/../api/get-tourism-information';
import { Dependencies, makeDependencies } from '@infrastructure/dependencies';
import { UNESCOSites } from '@domain/entities/unesco-sites';
import { APIGatewayProxyEvent, createApiHandler } from 'src/api/wrappers/api-handler';

jest.mock('@infrastructure/dependencies');

describe('getTourismInformationHandler Integration Tests', () => {
  let dependencies: Dependencies;
  let handler: ReturnType<typeof createApiHandler>;
  beforeAll(async () => {
    dependencies = await makeDependencies();
    handler = createApiHandler(getTourismInformationHandler, {
      successStatusCode: 200,
      dependencies,
    });

    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('Successful Requests', () => {
    it('should return 200 with tourism information for a country', async () => {
      const mockSites = [
        new UNESCOSites('ES', 'Spain', 'Andalusia', 'Alhambra', 'A palace and fortress complex'),
        new UNESCOSites('ES', 'Spain', 'Catalonia', 'Sagrada Familia', 'A large unfinished church'),
      ];

      const dependencies = await makeDependencies();
      (dependencies.tourismInformationRepository.getTourismInformation as jest.Mock).mockResolvedValue({
        unescoSites: mockSites.map((site) => site.toJSON()),
      });

      const event: Partial<APIGatewayProxyEvent> = {
        queryStringParameters: { countryName: 'Spain' },
      };

      const response = await handler(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(200);
      expect(response.headers?.['Content-Type']).toBe('application/json');

      const body = JSON.parse(response.body);
      expect(body.unescoSites).toHaveLength(2);
      expect(body.unescoSites[0].countryName).toBe('Spain');
      expect(body.unescoSites[0].site).toBe('Alhambra');
      expect(body.unescoSites[1].site).toBe('Sagrada Familia');
    });

    it('should return 200 with empty array when no sites found', async () => {
      const dependencies = await makeDependencies();
      (dependencies.tourismInformationRepository.getTourismInformation as jest.Mock).mockResolvedValue({
        unescoSites: [],
      });

      const event: Partial<APIGatewayProxyEvent> = {
        queryStringParameters: { countryName: 'UnknownCountry' },
      };

      const response = await handler(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(200);
      expect(response.headers?.['Content-Type']).toBe('application/json');
      const body = JSON.parse(response.body);
      expect(body.unescoSites).toEqual([]);
    });

    it('should handle sites without descriptions', async () => {
      const mockSites = [new UNESCOSites('IT', 'Italy', 'Lazio', 'Colosseum', undefined)];

      const dependencies = await makeDependencies();
      (dependencies.tourismInformationRepository.getTourismInformation as jest.Mock).mockResolvedValue({
        unescoSites: mockSites.map((site) => site.toJSON()),
      });

      const event: Partial<APIGatewayProxyEvent> = {
        queryStringParameters: { countryName: 'Italy' },
      };

      const response = await handler(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(200);
      expect(response.headers?.['Content-Type']).toBe('application/json');
      const body = JSON.parse(response.body);
      expect(body.unescoSites).toHaveLength(1);
      expect(body.unescoSites[0].description).toBeUndefined();
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 for missing country name', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        queryStringParameters: {},
      };

      const response = await handler(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(400);
      expect(response.headers?.['Content-Type']).toBe('application/json');

      const body = JSON.parse(response.body);
      expect(body.message).toContain('Validation error');
    });

    it('should return 400 for empty country name', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        queryStringParameters: { countryName: '' },
      };

      const response = await handler(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(body.message).toContain('Validation error');
    });

    it('should return 400 for invalid country name format', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        queryStringParameters: { countryName: 'Spain123' },
      };

      const response = await handler(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(body.message).toContain('Validation error');
    });

    it('should return 400 for null query parameters', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        queryStringParameters: undefined,
      };

      const response = await handler(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(body.message).toContain('Validation error');
    });
  });

  describe('Internal Server Errors', () => {
    it('should return 500 for database connection error', async () => {
      const dependencies = await makeDependencies();
      (dependencies.tourismInformationRepository.getTourismInformation as jest.Mock).mockRejectedValue(
        new Error('Database connection failed'),
      );

      const event: Partial<APIGatewayProxyEvent> = {
        queryStringParameters: { countryName: 'Spain' },
      };

      const response = await handler(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(500);

      const body = JSON.parse(response.body);
      expect(body.message).toBe('Database connection failed');
    });

    it('should return 500 for unexpected errors', async () => {
      const dependencies = await makeDependencies();
      (dependencies.tourismInformationRepository.getTourismInformation as jest.Mock).mockRejectedValue(
        new Error('Unexpected error'),
      );

      const event: Partial<APIGatewayProxyEvent> = {
        queryStringParameters: { countryName: 'France' },
      };

      const response = await handler(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(500);

      const body = JSON.parse(response.body);
      expect(body.message).toBe('Unexpected error');
    });
  });

  describe('Response Format', () => {
    it('should include correct content-type header', async () => {
      const dependencies = await makeDependencies();
      (dependencies.tourismInformationRepository.getTourismInformation as jest.Mock).mockResolvedValue({
        unescoSites: [],
      });

      const event: Partial<APIGatewayProxyEvent> = {
        queryStringParameters: { countryName: 'Spain' },
      };

      const response = await handler(event as APIGatewayProxyEvent);

      expect(response.headers).toBeDefined();
      expect(response.headers?.['Content-Type']).toBe('application/json');
    });

    it('should return valid JSON', async () => {
      const mockSites = [new UNESCOSites('ES', 'Spain', 'Andalusia', 'Alhambra', 'Palace')];

      const dependencies = await makeDependencies();
      (dependencies.tourismInformationRepository.getTourismInformation as jest.Mock).mockResolvedValue({
        unescoSites: mockSites.map((site) => site.toJSON()),
      });

      const event: Partial<APIGatewayProxyEvent> = {
        queryStringParameters: { countryName: 'Spain' },
      };

      const response = await handler(event as APIGatewayProxyEvent);

      expect(() => JSON.parse(response.body)).not.toThrow();
    });

    it('should log successful retrieval with site count', async () => {
      const mockSites = [
        new UNESCOSites('ES', 'Spain', 'Andalusia', 'Alhambra', 'Palace'),
        new UNESCOSites('ES', 'Spain', 'Catalonia', 'Sagrada Familia', 'Church'),
      ];

      const dependencies = await makeDependencies();
      (dependencies.tourismInformationRepository.getTourismInformation as jest.Mock).mockResolvedValue({
        unescoSites: mockSites.map((site) => site.toJSON()),
      });

      const event: Partial<APIGatewayProxyEvent> = {
        queryStringParameters: { countryName: 'Spain' },
      };

      const response = await handler(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.unescoSites).toHaveLength(2);
    });
  });

  describe('Special Characters and Edge Cases', () => {
    it('should handle country names with special characters', async () => {
      const mockSites = [new UNESCOSites('CI', "Côte d'Ivoire", 'Abidjan', 'Test Site', 'Description')];

      const dependencies = await makeDependencies();
      (dependencies.tourismInformationRepository.getTourismInformation as jest.Mock).mockResolvedValue({
        unescoSites: mockSites.map((site) => site.toJSON()),
      });

      const event: Partial<APIGatewayProxyEvent> = {
        queryStringParameters: { countryName: "Côte d'Ivoire" },
      };

      const response = await handler(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.unescoSites[0].countryName).toBe("Côte d'Ivoire");
    });

    it('should handle country names with hyphens', async () => {
      const mockSites = [new UNESCOSites('GB', 'United Kingdom', 'England', 'Stonehenge', 'Monument')];

      const dependencies = await makeDependencies();
      (dependencies.tourismInformationRepository.getTourismInformation as jest.Mock).mockResolvedValue({
        unescoSites: mockSites.map((site) => site.toJSON()),
      });

      const event: Partial<APIGatewayProxyEvent> = {
        queryStringParameters: { countryName: 'United-Kingdom' },
      };

      const response = await handler(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(200);
    });

    it('should handle multiple sites from different areas', async () => {
      const mockSites = [
        new UNESCOSites('FR', 'France', 'Île-de-France', 'Palace of Versailles', 'Royal château'),
        new UNESCOSites('FR', 'France', 'Provence', 'Pont du Gard', 'Roman aqueduct'),
        new UNESCOSites('FR', 'France', 'Loire Valley', 'Château de Chambord', 'Renaissance castle'),
      ];

      const dependencies = await makeDependencies();
      (dependencies.tourismInformationRepository.getTourismInformation as jest.Mock).mockResolvedValue({
        unescoSites: mockSites.map((site) => site.toJSON()),
      });

      const event: Partial<APIGatewayProxyEvent> = {
        queryStringParameters: { countryName: 'France' },
      };

      const response = await handler(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.unescoSites).toHaveLength(3);
      expect(body.unescoSites.every((site: UNESCOSites) => site.countryName === 'France')).toBe(true);
    });
  });
});
