export interface ApplicationConfig {
  database: {
    connectionString: string;
  };
  service: {
    name: string;
  };
  api: {
    restCountriesUrl: string;
    restCountriesAuthorization: string;
    populationApiUrl: string;
  };
}
