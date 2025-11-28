// Domain
export { CountryDetail, Currency, Coordinates, MapDetails } from './domain/entities/country-detail';
export { CityPopulation } from './domain/entities/city-population';
export { NationalDish } from './domain/entities/national-dish';

// Application
export { ListCountryInformationUseCase } from './application/list-country-information';
export type { CountryInformationResult } from './application/list-country-information';
export { validateCountryInformationRequest } from './application/validator';

// Application Interfaces
export type { CountryApiRepository, CountryDataRepository } from './application/interfaces/repositories';

// Infrastructure
export { RestCountriesApiRepository } from './infrastructure/repositories/rest-countries-api-repository';
export { CountryDBRepository as PostgresCountryDataRepository } from './infrastructure/repositories/country-repository';
export { makeDependencies } from './infrastructure/dependencies';
export type { Dependencies } from './infrastructure/dependencies';
export { makeConfig } from './infrastructure/config';
export type { ApplicationConfig } from './infrastructure/config';
export { rdsClient } from './infrastructure/repositories/db/rds_client';
export type { DbClient } from './infrastructure/repositories/db/rds_client';

// API Layer
export { listCountryInformationHandler } from './api/list-country-information';

// Types
export type {
  APIGatewayEvent,
  APIGatewayProxyResult,
  ListCountryInformationQuery,
  CountryInformationResponse,
  ErrorResponse,
} from './types';
