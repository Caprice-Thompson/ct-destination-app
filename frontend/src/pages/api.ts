// Country Response Type
export interface CountryApiResponse {
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
  id: string;
  magnitude: number;
  depth: number;
  location: string;
  timestamp: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface EarthquakeAPIResponse {
  earthquakes: EarthquakeData[];
  countryName: string;
}

export interface EarthquakeStatisticsResponse {
  totalEarthquakes: number;
  monthlyEarthquakePercentage: number;
  avgTsunamiCount: number;
  avgMagnitude: number;
}
// API Functions
export const fetchCountryData = async (
  countryName: string,
): Promise<CountryApiResponse> => {
  const response = await fetch(
    `/api/countries?countryName=${encodeURIComponent(countryName)}`,
  );
  return response.json();
};

export const fetchTourismData = async (
  countryName: string,
): Promise<TourismAPIResponse> => {
  const response = await fetch(
    `/api/tourism?countryName=${encodeURIComponent(countryName)}`,
  );
  return response.json();
};

export const fetchMostRecentEarthquakes = async (
  countryName: string,
): Promise<EarthquakeAPIResponse> => {
  const response = await fetch(
    `/api/earthquakes?countryName=${encodeURIComponent(countryName)}`,
  );
  return response.json();
};

export const fetchEarthquakeStatistics = async (
  countryName: string,
  month: string,
): Promise<EarthquakeStatisticsResponse> => {
  console.log(
    "fetching earthquake statistics",
    countryName,
    month,
    "month type:",
    typeof month,
  );
  const response = await fetch(
    `/api/earthquakes/statistics?countryName=${encodeURIComponent(countryName)}&month=${encodeURIComponent(month)}`,
  );
  return response.json();
};

// Combined search result for React Query cache
export interface SearchParams {
  country: string;
  month: string;
}

export interface SearchResult {
  countryData: CountryApiResponse;
  tourismData: TourismAPIResponse;
  earthquakeData: EarthquakeAPIResponse;
  earthquakeStatistics: EarthquakeStatisticsResponse;
}

// Query key factory for search - use consistently across Home and Dashboard
export const searchQueryKeys = {
  all: ["search"] as const,
  detail: (params: SearchParams) =>
    ["search", params.country, params.month] as const,
};

export const searchAPI = async (
  params: SearchParams,
): Promise<SearchResult> => {
  const [countryData, tourismData, earthquakeData, earthquakeStatistics] =
    await Promise.all([
      fetchCountryData(params.country),
      fetchTourismData(params.country),
      fetchMostRecentEarthquakes(params.country),
      fetchEarthquakeStatistics(params.country, params.month),
    ]);

  return {
    countryData,
    tourismData,
    earthquakeData,
    earthquakeStatistics,
  };
};
