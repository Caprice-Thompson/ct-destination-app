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
import { SubTitle } from "../components/SubTitle";
import { DescriptionText } from "../components/DescriptionText";
import { FaGlobeAmericas, FaRegBookmark } from "react-icons/fa";
import { BsBuildings } from "react-icons/bs";
import { WiDaySunny, WiEarthquake } from "react-icons/wi";
import { DashboardFooter } from "../components/DashboardFooter";
import { GiKnifeFork } from "react-icons/gi";
import { convertMonthValue } from "../common/helper";
import { addCurrentPageToBookmarks } from "../helpers/addBookmarks";

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
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-linear-to-br from-blue-300/20 to-indigo-300/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-linear-to-tr from-purple-300/20 to-pink-300/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
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
          <div className="flex flex-col items-end gap-1 relative">
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
              className={`absolute top-full mt-1 whitespace-nowrap text-sm font-medium text-green-600 transition-opacity ${
                bookmarkSaved ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              Bookmark saved!
            </span>
          </div>
        </div>

        <div className="mb-12 relative">
          {countryDetails.flagUrl && (
            <div className="absolute top-0 right-0 bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-4">
              <img
                src={countryDetails.flagUrl}
                alt={`${countryDetails.countryName} flag`}
                className="w-32 h-24 object-cover rounded-xl"
              />
            </div>
          )}
          <h1 className="text-5xl lg:text-6xl font-black text-gray-900 mb-4">
            Discover
          </h1>
          <h2 className="text-5xl lg:text-6xl font-black bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            {countryDetails.countryName}
          </h2>
          <h3 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6">
            In {convertMonthValue(month)}
          </h3>
          <p className="text-gray-600 text-lg max-w-2xl leading-relaxed">
            Explore comprehensive travel data, cultural insights, and essential
            facts about any european country.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-12">
          <div className="grid grid-cols-2 gap-6">
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
              value={
                countryDetails.timezone.map((tz) => tz).join(", ") || "N/A"
              }
              color="pink"
            />
          </div>
        </div>

        <div className="mb-12">
          <div className="text-center mb-8">
            <SubTitle>Complete Country Overview</SubTitle>
            <DescriptionText>
              All essential travel data and country facts displayed at a glance
            </DescriptionText>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoCard
              title="General Info"
              icon={<FaGlobeAmericas />}
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
              iconBg="bg-linear-to-br from-pink-500 to-rose-600"
            >
              <div className="space-y-3">
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
        </div>

        {tourismData.unescoSites.length > 0 && (
          <div className="mb-12">
            <InfoCard
              title="UNESCO World Heritage Sites"
              icon={<BsBuildings />}
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

        <div className="grid lg:grid-cols-2 gap-6 mb-12">
          <InfoCard
            title={`${convertMonthValue(month)} Weather`}
            icon={<WiDaySunny />}
            iconBg="bg-linear-to-br from-cyan-500 to-blue-600"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-linear-to-br from-cyan-50 to-blue-50 rounded-2xl">
                <p className="text-3xl font-black text-gray-900 mb-1">
                  {weatherSummary.averageMinTemperature.toFixed(1)}°C
                </p>
                <p className="text-sm text-gray-600">Average minimum</p>
              </div>
              <div className="p-4 bg-linear-to-br from-orange-50 to-yellow-50 rounded-2xl">
                <p className="text-3xl font-black text-gray-900 mb-1">
                  {weatherSummary.averageMaxTemperature.toFixed(1)}°C
                </p>
                <p className="text-sm text-gray-600">Average maximum</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Based on {weatherSummary.totalWeatherRecords} weather records.
            </p>
            {isAILoading && (
              <div className="mt-3 p-4 bg-linear-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-100 animate-pulse">
                <div className="h-8 bg-purple-100 rounded w-20 mb-1" />
                <div className="h-4 bg-purple-100 rounded w-32" />
              </div>
            )}
            {aiWeather && (
              <div className="mt-3 p-4 bg-linear-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-100">
                <p className="text-3xl font-black text-gray-900 mb-1">
                  {aiWeather.temperature}°C
                </p>
                <p className="text-sm text-gray-600">AI estimated average</p>
              </div>
            )}
          </InfoCard>

          {earthquakeStatistics && (
            <InfoCard
              title="Earthquake Activity"
              icon={<WiEarthquake />}
              iconBg="bg-linear-to-br from-red-500 to-orange-600"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-linear-to-br from-red-50 to-orange-50 rounded-2xl">
                  <p className="text-3xl font-black text-gray-900 mb-1">
                    {`${earthquakeStatistics.monthlyEarthquakePercentage}%`}
                  </p>
                  <p className="text-sm text-gray-600">
                    Of earthquakes occur in {convertMonthValue(month)}
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
          )}
        </div>

        {earthquakeData && (
          <div className="mb-12">
            <InfoCard
              title="Most Recent Earthquakes"
              icon={<WiEarthquake />}
              iconBg="bg-linear-to-br from-amber-500 to-yellow-600"
              className="lg:col-span-3"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                {earthquakeData.earthquakes.map((eq) => (
                  <div
                    key={eq.place}
                    className="p-4 bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100"
                  >
                    <h3 className="font-bold text-gray-900 mb-2">
                      {`${eq.place}: ${eq.date.split("T")[0]}`}
                    </h3>
                    <p className="text-sm text-gray-600">{eq.magnitude}</p>
                  </div>
                ))}
              </div>
            </InfoCard>
          </div>
        )}
        <DashboardFooter />
      </div>
    </div>
  );
}
