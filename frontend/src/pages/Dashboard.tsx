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
import { SubTitle } from "../components/SubTitle";
import { DescriptionText } from "../components/DescriptionText";
import { LuChartNoAxesColumnIncreasing } from "react-icons/lu";
import { FaPassport, FaPeopleGroup } from "react-icons/fa6";
import { FaGlobeAmericas } from "react-icons/fa";
import { CiLocationOn } from "react-icons/ci";
import { BsBuildings } from "react-icons/bs";
import { WiDaySunny, WiEarthquake } from "react-icons/wi";
import { IoLocationOutline } from "react-icons/io5";
import { DashboardFooter } from "../components/DashboardFooter";
import { GiKnifeFork } from "react-icons/gi";
import { convertMonthValue } from "../common/helper";

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

  const {
    countryData,
    tourismData,
    earthquakeStatistics,
    earthquakeData,
    weatherSummary,
  } = data;
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
                <IoLocationOutline />
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
              All essential travel data and country facts displayed at a
              glance—no clicking required
            </DescriptionText>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoCard
              title="Economic Data"
              icon={<LuChartNoAxesColumnIncreasing />}
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
              icon={<FaPeopleGroup />}
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
              icon={<CiLocationOn />}
              iconBg="bg-linear-to-br from-orange-500 to-red-600"
            >
              <div className="space-y-3">
                <DataRow label="Area" value="377,975 km²" bold />
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
              </div>
            </InfoCard>

            <InfoCard
              title="Travel Requirements"
              icon={<FaPassport />}
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
