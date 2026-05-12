export interface ApplicationConfig {
    aws: {
        region: string;
        accessKeyId: string;
        secretAccessKey: string;
        sessionToken?: string;
    };
    isTestEnv: boolean;
    service: {
        name: string;
    };
    tables: {
        earthquakes: string;
    };
    urls: {
        earthquakesApi: string;
        restCountriesApiUrl: string;
    };
}
