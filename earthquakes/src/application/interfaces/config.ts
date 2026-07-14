export interface ApplicationConfig {
  aws: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken?: string;
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
    restCountriesAuthorization: string;
  };
}
