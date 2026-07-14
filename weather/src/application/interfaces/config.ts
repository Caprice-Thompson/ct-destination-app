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
    weather: string;
  };
}
