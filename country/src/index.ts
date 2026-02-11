// Domain
export {
  CountryFacts as CountryDetail,
  Currency,
  Coordinates,
  MapDetails,
} from "./domain/entities/country-facts";
export { CityPopulation } from "./domain/entities/city-population";
export { NationalDish } from "./domain/entities/national-dish";

// Application
export { ListCountryInformation as ListCountryInformationUseCase } from "./application/list-country-information";
export type { CountryInformationResult } from "./application/list-country-information";
export { validateCountryInformationRequest } from "./application/validator";

// Application Interfaces
export type {
  CountryApiRepositoryInterface as CountryApiRepository,
  CountryDatabaseRepositoryInterface as CountryDataRepository,
  PopulationApiRepositoryInterface,
} from "./application/interfaces/repositories";

// Infrastructure
export { RestCountriesApiRepository } from "./infrastructure/repositories/rest-countries-api-repository";
export { PopulationApiRepository } from "./infrastructure/repositories/population-api-repository";
export { CountryDatabaseBRepository as PostgresCountryDataRepository } from "./infrastructure/repositories/country-database-repository";
export { makeDependencies } from "./infrastructure/dependencies";
export type { Dependencies } from "./infrastructure/dependencies";
export { makeConfig } from "./infrastructure/config";
export type { ApplicationConfig } from "./infrastructure/config";
export { rdsClient } from "./infrastructure/repositories/db/rds_client";
export type { DbClient } from "./infrastructure/repositories/db/rds_client";

// API Layer
export { listCountryInformationHandler } from "./api/list-country-information";

// Types
export type {
  APIGatewayEvent,
  APIGatewayProxyResult,
  ListCountryInformationQuery,
  CountryInformationResponse,
  ErrorResponse,
} from "./types";
