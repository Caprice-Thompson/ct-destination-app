import {
  Coordinates,
  CountryFacts,
  Currency,
  MapDetails,
} from "@domain/entities/country-facts";
import { NationalDish } from "@domain/entities/national-dish";
import {
  listCountryInformationHandler,
  resetDependencies,
} from "@infrastructure/../api/list-country-information";
import { makeDependencies } from "@infrastructure/dependencies";
import type { APIGatewayEvent } from "src";

jest.mock("@infrastructure/dependencies");

describe("listCountryInformationHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetDependencies();

    const mockCountryApiRepository = {
      getCountryDetailsByName: jest.fn(),
    };

    const mockCountryDatabaseRepository = {
      getTopCityPopulations: jest.fn(),
      getNationalDish: jest.fn(),
    };

    (makeDependencies as jest.Mock).mockResolvedValue({
      listCountryInformationUseCase: {
        listCountryInfo: jest.fn(),
      },
      config: {},
      rdsClient: {},
      countryApiRepository: mockCountryApiRepository,
      countryDataRepository: mockCountryDatabaseRepository,
    });

    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe("Successful Requests", () => {
    it("should return 200 with complete country information", async () => {
      const mockCountry = new CountryFacts({
        countryCode: "ES",
        countryName: "Spain",
        capitalCityName: "Madrid",
        flagUrl: "https://flagcdn.com/es.svg",
        languages: ["Spanish", "Catalan"],
        currency: new Currency("Euro", "€"),
        coordinates: new Coordinates(40.0, -4.0),
        maps: new MapDetails("https://google.com", "https://osm.org"),
      });

      const mockPopulation = [{ cityName: "Madrid", population: 3223334 }];
      const mockDish = new NationalDish(
        "Spain",
        "Paella",
        "www.pizza.svg",
        "ES",
        "A traditional Spanish rice dish",
      );

      const dependencies = await makeDependencies();
      (
        dependencies.listCountryInformationUseCase.listCountryInfo as jest.Mock
      ).mockResolvedValue({
        countryDetails: mockCountry.toJSON(),
        cityPopulation: mockPopulation,
        nationalDish: mockDish,
      });

      const event: APIGatewayEvent = {
        queryStringParameters: { countryName: "Spain" },
      };

      const response = await listCountryInformationHandler(event);
      expect(response.statusCode).toBe(200);
      expect(response.headers?.["Content-Type"]).toBe("application/json");

      const body = JSON.parse(response.body);
      expect(body.countryDetails.countryCode).toBe("ES");
      expect(body.countryDetails.countryName).toBe("Spain");
      expect(body.cityPopulation[0].population).toBe(3223334);
      expect(body.nationalDish.countryName).toBe("Spain");
      expect(body.nationalDish.dishName).toBe("Paella");
      expect(body.nationalDish.imageUrl).toBe("www.pizza.svg");
      expect(body.nationalDish.description).toBe(
        "A traditional Spanish rice dish",
      );
    });

    it("should handle missing optional data (population and dish)", async () => {
      const mockCountry = new CountryFacts({
        countryCode: "XX",
        countryName: "Test",
        capitalCityName: "Test City",
        flagUrl: "https://flag.url",
        languages: ["Test"],
        currency: new Currency("Test", "T"),
        coordinates: new Coordinates(0, 0),
        maps: new MapDetails("", ""),
      });

      const dependencies = await makeDependencies();
      (
        dependencies.listCountryInformationUseCase.listCountryInfo as jest.Mock
      ).mockResolvedValue({
        countryDetails: mockCountry,
        cityPopulation: undefined,
        nationalDish: undefined,
      });

      const event: APIGatewayEvent = {
        queryStringParameters: { countryName: "Test" },
      };

      const response = await listCountryInformationHandler(event);
      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.countryDetails.countryCode).toBe("XX");
      expect(body.cityPopulation).toBeUndefined();
      expect(body.nationalDish).toBeUndefined();
    });
  });

  describe("Validation Errors", () => {
    it("should return 400 for missing country name", async () => {
      const event: APIGatewayEvent = {
        queryStringParameters: {},
      };

      const response = await listCountryInformationHandler(event);

      expect(response.statusCode).toBe(400);
      expect(response.headers?.["Content-Type"]).toBe("application/json");

      const body = JSON.parse(response.body);
      expect(body.message).toContain("Validation error");
    });

    it("should return 400 for empty country name", async () => {
      const event: APIGatewayEvent = {
        queryStringParameters: { countryName: "" },
      };

      const response = await listCountryInformationHandler(event);

      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(body.message).toContain("Validation error");
    });

    it("should return 400 for invalid country name format", async () => {
      const event: APIGatewayEvent = {
        queryStringParameters: { countryName: "Spain123" },
      };

      const response = await listCountryInformationHandler(event);

      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(body.message).toContain("Validation error");
    });

    it("should return 400 for null query parameters", async () => {
      const event: APIGatewayEvent = {
        queryStringParameters: null,
      };

      const response = await listCountryInformationHandler(event);

      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(body.message).toContain("Validation error");
    });
  });

  describe("Not Found Errors", () => {
    it("should return 404 when country is not found", async () => {
      const dependencies = await makeDependencies();
      (
        dependencies.listCountryInformationUseCase.listCountryInfo as jest.Mock
      ).mockRejectedValue(new Error("Country not found: NonExistent"));

      const event: APIGatewayEvent = {
        queryStringParameters: { countryName: "NonExistent" },
      };

      const response = await listCountryInformationHandler(event);

      expect(response.statusCode).toBe(404);

      const body = JSON.parse(response.body);
      expect(body.message).toContain("Country not found");
    });
  });

  describe("Internal Server Errors", () => {
    it("should return 500 for use case errors", async () => {
      const dependencies = await makeDependencies();
      (
        dependencies.listCountryInformationUseCase.listCountryInfo as jest.Mock
      ).mockRejectedValue(new Error("Database connection failed"));

      const event: APIGatewayEvent = {
        queryStringParameters: { countryName: "Spain" },
      };

      const response = await listCountryInformationHandler(event);

      expect(response.statusCode).toBe(500);

      const body = JSON.parse(response.body);
      expect(body.message).toBe("Database connection failed");
    });

    it("should return 500 for unexpected errors", async () => {
      const dependencies = await makeDependencies();
      (
        dependencies.listCountryInformationUseCase.listCountryInfo as jest.Mock
      ).mockRejectedValue(new Error("Unexpected error"));

      const event: APIGatewayEvent = {
        queryStringParameters: { countryName: "Spain" },
      };

      const response = await listCountryInformationHandler(event);

      expect(response.statusCode).toBe(500);

      const body = JSON.parse(response.body);
      expect(body.message).toBe("Unexpected error");
    });

    it("should not include stack trace in production", async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const dependencies = await makeDependencies();
      (
        dependencies.listCountryInformationUseCase.listCountryInfo as jest.Mock
      ).mockRejectedValue(new Error("Test error"));

      const event: APIGatewayEvent = {
        queryStringParameters: { countryName: "Spain" },
      };

      const response = await listCountryInformationHandler(event);

      const body = JSON.parse(response.body);
      expect(body.details).toBeUndefined();

      process.env.NODE_ENV = originalEnv;
    });

    it("should include stack trace in development", async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      const error = new Error("Test error");
      const dependencies = await makeDependencies();
      (
        dependencies.listCountryInformationUseCase.listCountryInfo as jest.Mock
      ).mockRejectedValue(error);

      const event: APIGatewayEvent = {
        queryStringParameters: { countryName: "Spain" },
      };

      const response = await listCountryInformationHandler(event);

      const body = JSON.parse(response.body);
      expect(body.details).toBeDefined();
      expect(body.details).toContain("Test error");

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe("Dependency Injection", () => {
    it("should get use case from dependency container", async () => {
      const mockCountry = new CountryFacts({
        countryCode: "FR",
        countryName: "France",
        capitalCityName: "Paris",
        flagUrl: "https://flag.url",
        languages: ["French"],
        currency: new Currency("Euro", "€"),
        coordinates: new Coordinates(46.0, 2.0),
        maps: new MapDetails("", ""),
      });

      const dependencies = await makeDependencies();
      (
        dependencies.listCountryInformationUseCase.listCountryInfo as jest.Mock
      ).mockResolvedValue({
        countryDetails: mockCountry,
        cityPopulation: undefined,
        nationalDish: undefined,
      });

      const event: APIGatewayEvent = {
        queryStringParameters: { countryName: "France" },
      };

      await listCountryInformationHandler(event);

      expect(makeDependencies).toHaveBeenCalled();
      expect(
        dependencies.listCountryInformationUseCase.listCountryInfo,
      ).toHaveBeenCalledWith("France");
    });
  });

  describe("Response Format", () => {
    it("should include correct content-type header", async () => {
      const mockCountry = new CountryFacts({
        countryCode: "ES",
        countryName: "Spain",
        capitalCityName: "Madrid",
        flagUrl: "https://flag.url",
        languages: ["Spanish"],
        currency: new Currency("Euro", "€"),
        coordinates: new Coordinates(40.0, -4.0),
        maps: new MapDetails("", ""),
      });

      const dependencies = await makeDependencies();
      (
        dependencies.listCountryInformationUseCase.listCountryInfo as jest.Mock
      ).mockResolvedValue({
        countryDetails: mockCountry,
        cityPopulation: undefined,
        nationalDish: undefined,
      });

      const event: APIGatewayEvent = {
        queryStringParameters: { countryName: "Spain" },
      };

      const response = await listCountryInformationHandler(event);

      expect(response.headers).toBeDefined();
      expect(response.headers?.["Content-Type"]).toBe("application/json");
    });

    it("should return valid JSON", async () => {
      const mockCountry = new CountryFacts({
        countryCode: "ES",
        countryName: "Spain",
        capitalCityName: "Madrid",
        flagUrl: "https://flag.url",
        languages: ["Spanish"],
        currency: new Currency("Euro", "€"),
        coordinates: new Coordinates(40.0, -4.0),
        maps: new MapDetails("", ""),
      });

      const dependencies = await makeDependencies();
      (
        dependencies.listCountryInformationUseCase.listCountryInfo as jest.Mock
      ).mockResolvedValue({
        countryDetails: mockCountry,
        cityPopulation: undefined,
        nationalDish: undefined,
      });

      const event: APIGatewayEvent = {
        queryStringParameters: { countryName: "Spain" },
      };

      const response = await listCountryInformationHandler(event);

      expect(() => JSON.parse(response.body)).not.toThrow();
    });
  });
});
