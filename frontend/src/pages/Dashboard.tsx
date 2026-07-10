import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useSearch } from "@tanstack/react-router";
import { AppRoute } from "../common/enums";
import { dashboardRoute } from "../routes/dashboard";
import {
  type SearchResult,
  searchAPI,
  searchQueryKeys,
  fetchAIWeatherInsight,
  aiWeatherQueryKeys,
} from "./api";
import { Button } from "../components/Button";
import { InfoCard } from "../components/InfoCard";
import { StatCard } from "../components/StatCard";
import { DataRow } from "../components/DataRow";
import { FaArrowLeft, FaGlobeAmericas, FaRegBookmark } from "react-icons/fa";
import { BsBuildings } from "react-icons/bs";
import { WiDaySunny, WiEarthquake } from "react-icons/wi";
import { DashboardFooter } from "../components/DashboardFooter";
import { GiKnifeFork } from "react-icons/gi";
import { convertMonthValue } from "../common/helper";
import { addCurrentPageToBookmarks } from "../helpers/addBookmarks";
import { useAuth } from "../hooks/useAuth";

export function Dashboard() {
  const { country, month } = useSearch({ from: dashboardRoute.id });
  const { data, isLoading, error } = useQuery<SearchResult>({
    queryKey: searchQueryKeys.detail({ country, month }),
    queryFn: () => searchAPI({ country, month }),
    enabled: Boolean(country && month),
  });

  const { data: aiWeather, isLoading: isAILoading } = useQuery({
    queryKey: aiWeatherQueryKeys.detail({ country, month }),
    queryFn: () => fetchAIWeatherInsight(country, month),
    enabled: Boolean(country && month),
    retry: false,
    staleTime: Infinity,
  });

  const [bookmarkSaved, setBookmarkSaved] = useState(false);
  const { isAuthenticated } = useAuth();

  if (!country || !month) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-sm w-full">
          <div className="w-12 h-12 bg-blue-600 rounded-xl mx-auto mb-5 flex items-center justify-center">
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            No search parameters
          </h2>
          <p className="text-slate-500 text-sm mb-8">
            Select a country and month from the home page to explore.
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500 font-medium">
            Loading destination data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-sm w-full">
          <div className="w-12 h-12 bg-red-500 rounded-xl mx-auto mb-5 flex items-center justify-center">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-slate-500 text-sm mb-8">
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

  const {
    countryData,
    tourismData,
    earthquakeStatistics,
    earthquakeData,
    weatherSummary,
  } = data;
  const { countryDetails } = countryData;

  const topCities =
    countryData.cityPopulation
      ?.sort((a, b) => b.population - a.population)
      .slice(0, 3)
      .map((c) => c.cityName) || [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky top navigation */}
      <nav className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to={AppRoute.Home}>
            <button className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              <FaArrowLeft />
              Explore the World
            </button>
          </Link>
          <div className="relative flex flex-col items-end">
            {isAuthenticated && (
              <>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => {
                    setBookmarkSaved(true);
                    addCurrentPageToBookmarks();
                    setTimeout(() => setBookmarkSaved(false), 3000);
                  }}
                >
                  <FaRegBookmark />
                </Button>
                <span
                  className={`absolute top-full mt-1 right-0 whitespace-nowrap text-xs font-medium text-green-600 transition-opacity ${
                    bookmarkSaved
                      ? "opacity-100"
                      : "opacity-0 pointer-events-none"
                  }`}
                >
                  Bookmark saved!
                </span>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="flex items-start justify-between gap-6 mb-10 pb-10 border-b border-slate-200">
          <div>
            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full uppercase tracking-wider mb-4">
              {convertMonthValue(month)}
            </span>
            <h1 className="text-5xl font-black text-slate-900 mb-3 leading-tight">
              {countryDetails.countryName}
            </h1>
            <p className="text-slate-500 max-w-lg leading-relaxed">
              Explore comprehensive travel data, cultural insights, and
              essential facts about any European country.
            </p>
          </div>
          {countryDetails.flagUrl && (
            <img
              src={countryDetails.flagUrl}
              alt={`${countryDetails.countryName} flag`}
              className="w-32 h-20 object-cover rounded-xl border border-slate-200 shrink-0"
            />
          )}
        </div>

        {/* Key stats strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard
            label="Capital City"
            value={countryDetails.capitalCityName}
            color="green"
          />
          <StatCard
            label="Languages Spoken"
            value={
              countryDetails.languages.map((lang) => lang).join(", ") || "N/A"
            }
            color="orange"
          />
          <StatCard
            label="Currency"
            value={`${countryDetails.currency.name} (${countryDetails.currency.symbol})`}
            color="blue"
          />
          <StatCard
            label="Time Zone"
            value={countryDetails.timezone[0] || "N/A"}
            color="pink"
          />
        </div>

        {/* Country overview */}
        <section className="mb-10">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
            Country Overview
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <InfoCard
              title="General Info"
              icon={<FaGlobeAmericas />}
              iconBg="bg-indigo-600"
            >
              <div className="space-y-1">
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
                <DataRow
                  label="Capital City"
                  value={countryDetails.capitalCityName}
                />
                <DataRow
                  label="Popular Cities"
                  value={topCities.join(", ") || "N/A"}
                />
              </div>
            </InfoCard>

            <InfoCard
              title="National Dish"
              icon={<GiKnifeFork />}
              iconBg="bg-rose-500"
            >
              <div className="space-y-1">
                <DataRow
                  label="Name"
                  value={`${countryData.nationalDish?.dishName}`}
                  bold
                />
                <DataRow
                  label="Description"
                  value={`${countryData.nationalDish?.description}`}
                />
                <DataRow
                  label="Image"
                  value={`${countryData.nationalDish?.imageUrl}`}
                />
              </div>
            </InfoCard>
          </div>
        </section>

        {/* UNESCO World Heritage */}
        {tourismData.unescoSites.length > 0 && (
          <section className="mb-10">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
              UNESCO World Heritage
            </p>
            <InfoCard
              title="UNESCO World Heritage Sites"
              icon={<BsBuildings />}
              iconBg="bg-amber-500"
            >
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {tourismData.unescoSites.map((site) => (
                  <div
                    key={site.site}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <h3 className="font-semibold text-slate-900 text-sm mb-1.5">
                      {site.site}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {site.description}
                    </p>
                  </div>
                ))}
              </div>
            </InfoCard>
          </section>
        )}

        {/* Climate & Seismic */}
        <section className="mb-10">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
            Climate & Seismic
          </p>
          <div className="grid lg:grid-cols-2 gap-4">
            <InfoCard
              title={`${convertMonthValue(month)} Weather`}
              icon={<WiDaySunny />}
              iconBg="bg-sky-500"
            >
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-2xl font-bold text-slate-900 mb-0.5">
                    {weatherSummary.averageMinTemperature.toFixed(1)}°C
                  </p>
                  <p className="text-xs text-slate-500">Average minimum</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-2xl font-bold text-slate-900 mb-0.5">
                    {weatherSummary.averageMaxTemperature.toFixed(1)}°C
                  </p>
                  <p className="text-xs text-slate-500">Average maximum</p>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Based on realistic representation weather records.
              </p>
              {isAILoading && (
                <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-100 animate-pulse">
                  <div className="h-7 bg-slate-200 rounded w-20 mb-1" />
                  <div className="h-3 bg-slate-200 rounded w-28" />
                </div>
              )}
              {aiWeather && (
                <div className="mt-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-2xl font-bold text-slate-900 mb-0.5">
                    {aiWeather.temperature}°C
                  </p>
                  <p className="text-xs text-slate-500">AI estimated average</p>
                </div>
              )}
            </InfoCard>

            {earthquakeStatistics &&
              earthquakeStatistics.monthlyEarthquakePercentage > 0 && (
                <InfoCard
                  title="Earthquake Activity"
                  icon={<WiEarthquake />}
                  iconBg="bg-red-500"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-2xl font-bold text-slate-900 mb-0.5">
                        {`${earthquakeStatistics.monthlyEarthquakePercentage}%`}
                      </p>
                      <p className="text-xs text-slate-500">
                        Of earthquakes occur in {convertMonthValue(month)}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-2xl font-bold text-slate-900 mb-0.5">
                        {earthquakeStatistics.avgMagnitude?.toFixed(1) || "N/A"}
                      </p>
                      <p className="text-xs text-slate-500">
                        Average magnitude
                      </p>
                    </div>
                  </div>
                </InfoCard>
              )}
          </div>
        </section>

        {/* Recent seismic events */}
        {earthquakeData && (
          <section className="mb-10">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
              Recent Seismic Events
            </p>
            <InfoCard
              title={`${country}'s Most Recent Earthquakes`}
              icon={<WiEarthquake />}
              iconBg="bg-amber-500"
            >
              <div className="grid sm:grid-cols-2 gap-3">
                {earthquakeData.earthquakes.map((eq) => (
                  <div
                    key={eq.place}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <h3 className="font-semibold text-slate-900 text-sm mb-1">
                      {`${eq.place}: ${eq.date.split("T")[0]}`}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Magnitude: {eq.magnitude}
                    </p>
                  </div>
                ))}
              </div>
            </InfoCard>
          </section>
        )}

        <DashboardFooter />
      </div>
    </div>
  );
}
