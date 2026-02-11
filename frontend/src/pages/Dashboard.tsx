import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useSearch } from "@tanstack/react-router";
import { AppRoute } from "../common/enums";
import { dashboardRoute } from "../routes/dashboard";
import { type SearchResult, searchAPI, searchQueryKeys } from "./api";
import { Button } from "../components/Button";
import { InfoCard } from "../components/InfoCard";
import { StatCard } from "../components/StatCard";
import { DataRow } from "../components/DataRow";

export function Dashboard() {
  const { country, month } = useSearch({ from: dashboardRoute.id });
  const { data, isLoading, error } = useQuery<SearchResult>({
    queryKey: searchQueryKeys.detail({ country, month }),
    queryFn: () => searchAPI({ country, month }),
    enabled: Boolean(country && month),
  });

  if (!country || !month) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-linear-to-br from-blue-400 to-indigo-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            No search parameters
          </h2>
          <p className="text-gray-600 mb-8">
            Please select a country and month from the home page to explore.
          </p>
          <Link to={AppRoute.Home}>
            <Button className="" type="button" variant="primary">
              Start Exploring
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-700 font-semibold text-lg">
            Loading destination data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-linear-to-br from-red-400 to-pink-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-8">
            We couldn&apos;t load the data. Please try again.
          </p>
          <Link to={AppRoute.Home}>
            <Button className="" type="button" variant="primary">
              Try Again
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { countryData, tourismData, earthquakeStatistics } = data;
  const { countryDetails } = countryData;

  const population = countryData.cityPopulation?.reduce(
    (sum, city) => sum + city.population,
    0,
  );
  const topCities =
    countryData.cityPopulation
      ?.sort((a, b) => b.population - a.population)
      .slice(0, 3)
      .map((c) => c.cityName) || [];

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-linear-to-br from-blue-300/20 to-indigo-300/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-linear-to-tr from-purple-300/20 to-pink-300/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link to={AppRoute.Home}>
            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-all shadow-sm hover:shadow-md">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Explore the World
            </button>
          </Link>
        </div>

        <div className="mb-12">
          <h1 className="text-5xl lg:text-6xl font-black text-gray-900 mb-4">
            Discover
          </h1>
          <h2 className="text-5xl lg:text-6xl font-black bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            {countryDetails.countryName}
          </h2>
          <h3 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6">
            Like Never Before
          </h3>
          <p className="text-gray-600 text-lg max-w-2xl leading-relaxed">
            Explore comprehensive travel data, cultural insights, and essential
            facts about any country—all in one beautifully designed platform.
          </p>
          <div className="flex gap-4 mt-8">
            <Button className="" type="button" variant="primary">
              Start Exploring
            </Button>
            <Button className="" type="button" variant="secondary">
              Watch Demo
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="px-4 py-1.5 bg-linear-to-r from-orange-400 to-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                Live Data
              </span>
            </div>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-md shrink-0">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">
                  Population
                </p>
                <p className="text-sm text-gray-500">Live statistics</p>
              </div>
            </div>
            <div className="mb-3">
              <p className="text-5xl font-black text-gray-900">
                {population
                  ? `${(population / 1000000).toFixed(1)}M`
                  : "125.8M"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              <span className="text-sm font-semibold text-green-600">
                +0.3% growth
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <StatCard
              label="Capital City"
              value={countryDetails.capitalCityName}
              bgColor="bg-linear-to-br from-green-50 to-emerald-50"
              textColor="text-gray-900"
            />
            <StatCard
              label="Language"
              value={countryDetails.languages[0] || "N/A"}
              bgColor="bg-linear-to-br from-amber-50 to-orange-50"
              textColor="text-gray-900"
            />
            <StatCard
              label="Currency"
              value={countryDetails.currency.symbol || "N/A"}
              bgColor="bg-linear-to-br from-blue-50 to-cyan-50"
              textColor="text-gray-900"
            />
            <StatCard
              label="Time Zone"
              value="JST +9"
              bgColor="bg-linear-to-br from-purple-50 to-pink-50"
              textColor="text-gray-900"
            />
          </div>
        </div>

        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Complete Country Overview
            </h2>
            <p className="text-gray-600">
              All essential travel data and country facts displayed at a
              glance—no clicking required
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoCard
              title="Economic Data"
              icon={
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              }
              iconBg="bg-linear-to-br from-blue-500 to-indigo-600"
            >
              <div className="space-y-3">
                <DataRow label="GDP" value="$4.9 Trillion" bold />
                <DataRow label="GDP per Capita" value="$39,048" />
                <DataRow label="Unemployment Rate" value="2.6%" />
                <DataRow label="Inflation Rate" value="3.2%" />
              </div>
            </InfoCard>

            <InfoCard
              title="Demographics"
              icon={
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              }
              iconBg="bg-linear-to-br from-green-500 to-emerald-600"
            >
              <div className="space-y-3">
                <DataRow
                  label="Population"
                  value={`${(population || 125800000) / 1000000}M`}
                  bold
                />
                <DataRow label="Median Age" value="48.4 years" />
                <DataRow label="Urban Population" value="91.8%" />
                <DataRow label="Life Expectancy" value="84.6 years" />
              </div>
            </InfoCard>

            <InfoCard
              title="Geography"
              icon={
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              }
              iconBg="bg-linear-to-br from-orange-500 to-red-600"
            >
              <div className="space-y-3">
                <DataRow label="Area" value="377,975 km²" bold />
                <DataRow label="Capital" value={countryDetails.capitalCityName} />
                <DataRow
                  label="Major Cities"
                  value={topCities.join(", ") || "N/A"}
                />
                <DataRow label="Coastline" value="29,751 km" />
              </div>
            </InfoCard>

            <InfoCard
              title="General Info"
              icon={
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              iconBg="bg-linear-to-br from-purple-500 to-indigo-600"
            >
              <div className="space-y-3">
                <DataRow
                  label="Official Language"
                  value={countryDetails.languages[0] || "N/A"}
                  bold
                />
                <DataRow
                  label="Currency"
                  value={`${countryDetails.currency.name} (${countryDetails.currency.symbol})`}
                />
                <DataRow label="Time Zone" value="JST (UTC+9)" />
                <DataRow label="Driving Side" value="Left" />
              </div>
            </InfoCard>

            <InfoCard
              title="Travel Requirements"
              icon={
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              }
              iconBg="bg-linear-to-br from-teal-500 to-cyan-600"
            >
              <div className="space-y-3">
                <DataRow label="Visa Required" value="Varies by country" bold />
                <DataRow label="Major Airport" value="Narita, Haneda" />
                <DataRow label="Tourist Visa" value="Up to 90 days" />
                <DataRow label="Vaccination" value="None required" />
              </div>
            </InfoCard>

            <InfoCard
              title="Cost of Living"
              icon={
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              iconBg="bg-linear-to-br from-pink-500 to-rose-600"
            >
              <div className="space-y-3">
                <DataRow label="Meal (Restaurant)" value="¥1,000-3,000" bold />
                <DataRow label="Hotel (Mid-range)" value="¥8,000-15,000/night" />
                <DataRow label="Local Transport" value="¥200-400/trip" />
                <DataRow label="Coffee" value="¥400-600" />
              </div>
            </InfoCard>
          </div>
        </div>

        {tourismData.unescoSites.length > 0 && (
          <div className="mb-12">
            <InfoCard
              title="UNESCO World Heritage Sites"
              icon={
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              }
              iconBg="bg-linear-to-br from-amber-500 to-yellow-600"
              className="lg:col-span-3"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                {tourismData.unescoSites.map((site) => (
                  <div
                    key={site.site}
                    className="p-4 bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100"
                  >
                    <h3 className="font-bold text-gray-900 mb-2">
                      {site.site}
                    </h3>
                    <p className="text-sm text-gray-600">{site.description}</p>
                  </div>
                ))}
              </div>
            </InfoCard>
          </div>
        )}

        {earthquakeStatistics && (
          <div>
            <InfoCard
              title="Earthquake Activity"
              icon={
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              }
              iconBg="bg-linear-to-br from-red-500 to-orange-600"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-linear-to-br from-red-50 to-orange-50 rounded-2xl">
                  <p className="text-3xl font-black text-gray-900 mb-1">
                    {earthquakeStatistics.totalEarthquakes}
                  </p>
                  <p className="text-sm text-gray-600">
                    Total earthquakes in {month}
                  </p>
                </div>
                <div className="p-4 bg-linear-to-br from-amber-50 to-yellow-50 rounded-2xl">
                  <p className="text-3xl font-black text-gray-900 mb-1">
                    {earthquakeStatistics.avgMagnitude?.toFixed(1) || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">Average magnitude</p>
                </div>
              </div>
            </InfoCard>
          </div>
        )}

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-8 text-sm">
            <div>
              <p className="text-3xl font-black bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                195+
              </p>
              <p className="text-gray-600 font-medium mt-1">Countries</p>
            </div>
            <div>
              <p className="text-3xl font-black bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                50+
              </p>
              <p className="text-gray-600 font-medium mt-1">Data Points</p>
            </div>
            <div>
              <p className="text-3xl font-black bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                24/7
              </p>
              <p className="text-gray-600 font-medium mt-1">Updated</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
