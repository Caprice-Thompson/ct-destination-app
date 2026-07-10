// Country Response Type
export interface CountryApiResponse {
  countryDetails: {
    countryCode: string;
    countryName: string;
    capitalCityName: string;
    flagUrl: string;
    languages: string[];
    timezone: string[];
    callingCodes: string[];
    drivingSide: "left" | "right";
    europeanUnionMember: boolean;
    schengenAreaMember: boolean;
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
  cityPopulation?: {
    cityName: string;
    population: number;
  }[];
  nationalDish?: {
    countryCode: string;
    countryName: string;
    dishName: string;
    imageUrl: string | null;
    description?: string;
  };
}

// Tourism Response Type
export interface TourismAPIResponse {
  unescoSites: {
    countryCode: string;
    countryName: string;
    areaName: string;
    site: string;
    description?: string;
  }[];
}

// Earthquake Response Types
export interface EarthquakeData {
  eventId: string;
  name: string;
  magnitude: number;
  date: string;
  type: string;
  tsunami: number;
  place: string;
  country: string;
}

export interface EarthquakeAPIResponse {
  earthquakes: EarthquakeData[];
  countryName: string;
}

export interface EarthquakeNotificationData {
  id: string;
  magnitude: number;
  location: string;
  occurredAt: string;
}

export interface NotificationResponse {
  newEvents: EarthquakeNotificationData[];
  lastChecked: string;
}

export interface EarthquakeStatisticsResponse {
  totalEarthquakes: number;
  monthlyEarthquakePercentage: number;
  avgTsunamiCount: number;
  avgMagnitude: number;
}

export interface WeatherSummaryResponse {
  countryName: string;
  month: string;
  totalWeatherRecords: number;
  averageMinTemperature: number;
  averageMaxTemperature: number;
}

const getJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
};

export const fetchCountryData = async (
  countryName: string,
): Promise<CountryApiResponse> => {
  return getJson<CountryApiResponse>(
    `/api/countries?countryName=${encodeURIComponent(countryName)}`,
  );
};

export const fetchTourismData = async (
  countryName: string,
): Promise<TourismAPIResponse> => {
  return getJson<TourismAPIResponse>(
    `/api/tourism?countryName=${encodeURIComponent(countryName)}`,
  );
};

export const fetchMostRecentEarthquakes = async (
  countryName: string,
): Promise<EarthquakeAPIResponse> => {
  return getJson<EarthquakeAPIResponse>(
    `/api/earthquakes?countryName=${encodeURIComponent(countryName)}`,
  );
};

export const fetchEarthquakeStatistics = async (
  countryName: string,
  month: string,
): Promise<EarthquakeStatisticsResponse> => {
  return getJson<EarthquakeStatisticsResponse>(
    `/api/earthquakes/statistics?countryName=${encodeURIComponent(countryName)}&month=${encodeURIComponent(month)}`,
  );
};

export const fetchEarthquakeNotifications = async (
  accessToken: string,
): Promise<NotificationResponse> => {
  const response = await fetch("/api/notifications", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<NotificationResponse>;
};

export const fetchWeatherSummary = async (
  countryName: string,
  month: string,
): Promise<WeatherSummaryResponse> => {
  return getJson<WeatherSummaryResponse>(
    `/api/weather?countryName=${encodeURIComponent(countryName)}&month=${encodeURIComponent(month)}`,
  );
};

export interface SearchParams {
  country: string;
  month: string;
}

export interface SearchResult {
  countryData: CountryApiResponse;
  tourismData: TourismAPIResponse;
  earthquakeData: EarthquakeAPIResponse;
  earthquakeStatistics: EarthquakeStatisticsResponse;
  weatherSummary: WeatherSummaryResponse;
}

export interface AIWeatherResponse {
  temperature: number;
}

export const fetchAIWeatherInsight = async (
  countryName: string,
  month: string,
): Promise<AIWeatherResponse> => {
  return getJson<AIWeatherResponse>(
    `/api/ai/weather?countryName=${encodeURIComponent(countryName)}&month=${encodeURIComponent(month)}`,
  );
};

export const aiWeatherQueryKeys = {
  detail: (params: SearchParams) =>
    ["ai-weather", params.country, params.month] as const,
};

export const searchQueryKeys = {
  all: ["search"] as const,
  detail: (params: SearchParams) =>
    ["search", params.country, params.month] as const,
};

export const searchAPI = async (
  params: SearchParams,
): Promise<SearchResult> => {
  const [
    countryData,
    tourismData,
    earthquakeData,
    earthquakeStatistics,
    weatherSummary,
  ] = await Promise.all([
    fetchCountryData(params.country),
    fetchTourismData(params.country),
    fetchMostRecentEarthquakes(params.country),
    fetchEarthquakeStatistics(params.country, params.month),
    fetchWeatherSummary(params.country, params.month),
  ]);

  return {
    countryData,
    tourismData,
    earthquakeData,
    earthquakeStatistics,
    weatherSummary,
  };
};
