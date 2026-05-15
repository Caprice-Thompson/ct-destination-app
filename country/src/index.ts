// Domain

export type { ApplicationConfig } from "@application/interfaces/config";
// API Layer
export { listCountryInformationHandler } from "./api/list-country-information";
// Application Interfaces
export type {
  CityPopulationRepository as PopulationApiRepository,
  NationalDishRepository as CountryDataRepository,
} from "./application/interfaces/repositories";

// Application
export {
  type CountryInformationResult,
  type ListCountryInformationQuery as ListCountryQuery,
  listCountryInformationQuery,
} from "./application/list-country-information/list-country-information-query";
export { validateCountryInformationRequest } from "./application/list-country-information/list-country-information-query-validator";
export { CityPopulation } from "./domain/entities/city-population";
export {
  Coordinates,
  CountryFacts as CountryDetail,
  Currency,
  MapDetails,
} from "./domain/entities/country-facts";
export { NationalDish } from "./domain/entities/national-dish";
export { makeConfig } from "./infrastructure/config";
export type { Dependencies } from "./infrastructure/dependencies";
export { makeDependencies } from "./infrastructure/dependencies";
export { makeLogger } from "./infrastructure/logger";
export type { RdsClient } from "./infrastructure/rds";
export { makeRdsClient } from "./infrastructure/rds";
export { makeNationalDishRepository } from "./infrastructure/repositories/national-dish-repository";
// Infrastructure
export { makeCountryRestApiService } from "./infrastructure/services/country-rest-api-service";
export { makePopulationApiService } from "./infrastructure/services/population-api-service";
