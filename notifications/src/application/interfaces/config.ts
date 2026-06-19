export interface ApplicationConfig {
  database: {
    connectionString: string;
  };
  service: {
    name: string;
  };
  urls: {
    earthquakesApi: string;
  };
}
