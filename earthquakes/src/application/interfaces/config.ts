export interface ApplicationConfig {
  aws: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken?: string;
  };
  database: {
    connectionString: string;
  };
  service: {
    name: string;
  };
  tables: {
    earthquakes: string;
  };
  urls: {
    usgsApi: string;
    restCountriesApiUrl: string;
  };
}
