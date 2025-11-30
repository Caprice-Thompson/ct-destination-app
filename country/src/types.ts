export interface APIGatewayEvent {
  queryStringParameters?: Record<string, string> | null;
  pathParameters?: Record<string, string> | null;
  body?: string | null;
  headers?: Record<string, string>;
}

export interface APIGatewayProxyResult {
  statusCode: number;
  body: string;
  headers?: Record<string, string>;
}

export interface ListCountryInformationQuery {
  countryName: string;
}

export interface CountryInformationResponse {
  countryDetails: {
    countryCode: string;
    countryName: string;
    capitalCityName: string;
    flagUrl: string;
    languages: string[];
    currency: {
      name: string;
      symbol: string;
    };
    coordinates: {
      latitude: number;
      longitude: number;
    };
    maps: {
      googleMaps: string;
      openStreetMaps: string;
    };
  };
  capitalPopulation?: {
    cityName: string;
    countryCode: string;
    population: number;
  };
  nationalDish?: {
    countryCode: string;
    dishName: string;
    imageUrl: string | null;
    description?: string;
  };
}

export interface ErrorResponse {
  message: string;
  details?: string;
}
