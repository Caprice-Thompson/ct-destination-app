import { getTourismInformationHandler } from '../../../src/api/get-tourism-information';
import type { Dependencies } from '@infrastructure/dependencies';
import type { DbClient } from '@infrastructure/rds';
import { UNESCOSites } from '@domain/entities/unesco-sites';
import { APIGatewayProxyEvent, createApiHandler } from '../../../src/api/wrappers/api-handler';

function buildTestDependencies(): Dependencies {
  return {
    tourismInformationRepository: {
      getTourismInformation: jest.fn(),
    },
    rdsClient: {
      closeConnection: jest.fn().mockResolvedValue(undefined),
    } as unknown as DbClient,
    logger: {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    },
    config: {
      database: {
        connectionString: 'postgresql://localhost/test',
        queryTimeout: 1000,
        connectionTimeout: 1000,
        useSSL: false,
      },
      service: { name: 'tourism-test' },
    },
  };
}

describe('getTourismInformationHandler Integration Tests', () => {
  let dependencies: Dependencies;
  let handler: ReturnType<typeof createApiHandler>;

  beforeAll(() => {
    dependencies = buildTestDependencies();
    handler = createApiHandler(getTourismInformationHandler, {
      successStatusCode: 200,
      dependencies,
    });

    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe("Successful Requests", () => {
    it("should return 200 with tourism information for a country", async () => {
      const mockSites = [
        new UNESCOSites(
          "ES",
          "Spain",
          "Andalusia",
          "Alhambra",
          "A palace and fortress complex",
        ),
        new UNESCOSites(
          "ES",
          "Spain",
          "Catalonia",
          "Sagrada Familia",
          "A large unfinished church",
        ),
      ];

      jest.mocked(dependencies.tourismInformationRepository.getTourismInformation).mockResolvedValue(mockSites);

      const event: Partial<APIGatewayProxyEvent> = {
        queryStringParameters: { countryName: 'Spain' },
      };

      const response = await handler(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(200);
      expect(response.headers?.["Content-Type"]).toBe("application/json");

      const body = JSON.parse(response.body);
      expect(body.unescoSites).toHaveLength(2);
      expect(body.unescoSites[0].countryName).toBe("Spain");
      expect(body.unescoSites[0].site).toBe("Alhambra");
      expect(body.unescoSites[1].site).toBe("Sagrada Familia");
    });

    it('should return 200 with empty array when no sites found', async () => {
      jest.mocked(dependencies.tourismInformationRepository.getTourismInformation).mockResolvedValue([]);

      const event: Partial<APIGatewayProxyEvent> = {
        queryStringParameters: { countryName: 'UnknownCountry' },
      };

      const response = await handler(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(200);
      expect(response.headers?.['Content-Type']).toBe('application/json');
      const body = JSON.parse(response.body);
      expect(body.unescoSites).toEqual([]);
    });

    it("should handle sites without descriptions", async () => {
      const mockSites = [
        new UNESCOSites("IT", "Italy", "Lazio", "Colosseum", undefined),
      ];

      jest.mocked(dependencies.tourismInformationRepository.getTourismInformation).mockResolvedValue(mockSites);

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
      expect(response.headers?.["Content-Type"]).toBe("application/json");

      const body = JSON.parse(response.body);
      expect(body.error).toBe('Validation failed');
      expect(body.details).toEqual(expect.arrayContaining([expect.objectContaining({ message: expect.any(String) })]));
    });

    it('should return 400 for empty country name', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        queryStringParameters: { countryName: '' },
      };

      const response = await handler(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(body.error).toBe('Validation failed');
      expect(body.details).toEqual(
        expect.arrayContaining([expect.objectContaining({ message: 'Country name is required' })]),
      );
    });

    it('should return 400 for invalid country name format', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        queryStringParameters: { countryName: 'Spain123' },
      };

      const response = await handler(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(body.error).toBe('Validation failed');
      expect(body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: 'Country name must contain only letters, spaces, hyphens, and apostrophes',
          }),
        ]),
      );
    });

    it('should return 400 for null query parameters', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        queryStringParameters: undefined,
      };

      const response = await handler(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(body.error).toBe('Validation failed');
    });
  });

  describe('Internal Server Errors', () => {
    it('should return 500 for database connection error', async () => {
      jest
        .mocked(dependencies.tourismInformationRepository.getTourismInformation)
        .mockRejectedValue(new Error('Database connection failed'));

      const event: Partial<APIGatewayProxyEvent> = {
        queryStringParameters: { countryName: 'Spain' },
      };

      const response = await handler(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(500);

      const body = JSON.parse(response.body);
      expect(body.error).toBe('Internal server error');
    });

    it('should return 500 for unexpected errors', async () => {
      jest
        .mocked(dependencies.tourismInformationRepository.getTourismInformation)
        .mockRejectedValue(new Error('Unexpected error'));

      const event: Partial<APIGatewayProxyEvent> = {
        queryStringParameters: { countryName: 'France' },
      };

      const response = await handler(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(500);

      const body = JSON.parse(response.body);
      expect(body.error).toBe('Internal server error');
    });
  });

  describe('Response Format', () => {
    it('should include correct content-type header', async () => {
      jest.mocked(dependencies.tourismInformationRepository.getTourismInformation).mockResolvedValue([]);

      const event: Partial<APIGatewayProxyEvent> = {
        queryStringParameters: { countryName: 'Spain' },
      };

      const response = await handler(event as APIGatewayProxyEvent);

      expect(response.headers).toBeDefined();
      expect(response.headers?.["Content-Type"]).toBe("application/json");
    });

    it("should return valid JSON", async () => {
      const mockSites = [
        new UNESCOSites("ES", "Spain", "Andalusia", "Alhambra", "Palace"),
      ];

      jest.mocked(dependencies.tourismInformationRepository.getTourismInformation).mockResolvedValue(mockSites);

      const event: Partial<APIGatewayProxyEvent> = {
        queryStringParameters: { countryName: 'Spain' },
      };

      const response = await handler(event as APIGatewayProxyEvent);

      expect(() => JSON.parse(response.body)).not.toThrow();
    });

    it("should log successful retrieval with site count", async () => {
      const mockSites = [
        new UNESCOSites("ES", "Spain", "Andalusia", "Alhambra", "Palace"),
        new UNESCOSites(
          "ES",
          "Spain",
          "Catalonia",
          "Sagrada Familia",
          "Church",
        ),
      ];

      jest.mocked(dependencies.tourismInformationRepository.getTourismInformation).mockResolvedValue(mockSites);

      const event: Partial<APIGatewayProxyEvent> = {
        queryStringParameters: { countryName: 'Spain' },
      };

      const response = await handler(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.unescoSites).toHaveLength(2);
    });
  });

  describe("Special Characters and Edge Cases", () => {
    it("should handle country names with special characters", async () => {
      const mockSites = [
        new UNESCOSites(
          "CI",
          "Côte d'Ivoire",
          "Abidjan",
          "Test Site",
          "Description",
        ),
      ];

      jest.mocked(dependencies.tourismInformationRepository.getTourismInformation).mockResolvedValue(mockSites);

      const event: Partial<APIGatewayProxyEvent> = {
        queryStringParameters: { countryName: "Côte d'Ivoire" },
      };

      const response = await handler(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.unescoSites[0].countryName).toBe("Côte d'Ivoire");
    });

    it("should handle country names with hyphens", async () => {
      const mockSites = [
        new UNESCOSites(
          "GB",
          "United Kingdom",
          "England",
          "Stonehenge",
          "Monument",
        ),
      ];

      jest.mocked(dependencies.tourismInformationRepository.getTourismInformation).mockResolvedValue(mockSites);

      const event: Partial<APIGatewayProxyEvent> = {
        queryStringParameters: { countryName: 'United-Kingdom' },
      };

      const response = await handler(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(200);
    });

    it("should handle multiple sites from different areas", async () => {
      const mockSites = [
        new UNESCOSites(
          "FR",
          "France",
          "Île-de-France",
          "Palace of Versailles",
          "Royal château",
        ),
        new UNESCOSites(
          "FR",
          "France",
          "Provence",
          "Pont du Gard",
          "Roman aqueduct",
        ),
        new UNESCOSites(
          "FR",
          "France",
          "Loire Valley",
          "Château de Chambord",
          "Renaissance castle",
        ),
      ];

      jest.mocked(dependencies.tourismInformationRepository.getTourismInformation).mockResolvedValue(mockSites);

      const event: Partial<APIGatewayProxyEvent> = {
        queryStringParameters: { countryName: 'France' },
      };

      const response = await handler(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.unescoSites).toHaveLength(3);
      expect(body.unescoSites.every((site: { countryName: string }) => site.countryName === 'France')).toBe(true);
    });
  });
});
