import { Link } from "@tanstack/react-router";
import { useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { dashboardRoute } from "../routes/dashboard";
import { searchAPI, searchQueryKeys, type SearchResult } from "./api";
import { AppRoute } from "../common/enums";

export function Dashboard() {
  const { country, month } = useSearch({ from: dashboardRoute.id });
  const { data, isLoading, error } = useQuery<SearchResult>({
    queryKey: searchQueryKeys.detail({ country, month }),
    queryFn: () => searchAPI({ country, month }),
    enabled: Boolean(country && month),
  });

  if (!country || !month) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-linear-to-br from-blue-100 to-indigo-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <span className="text-4xl">🔍</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            No search parameters
          </h2>
          <p className="text-gray-600 mb-6">
            Please select a country and month from the home page to explore.
          </p>
          <Link
            to={AppRoute.Home}
            className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Start exploring
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 font-medium">
            Loading your destination data...
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Fetching country, tourism & earthquake info
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-50 rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">
            We couldn&apos;t load the data. Please try again.
          </p>
          <Link
            to={AppRoute.Home}
            className="inline-flex px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl transition-all duration-200"
          >
            Try again
          </Link>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { countryData, tourismData, earthquakeData, earthquakeStatistics } =
    data;
  const { countryDetails } = countryData;

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50/80 via-white to-indigo-50/50 relative overflow-hidden">
      {/* Subtle decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 lg:py-16">
        {/* Header */}
        <div className="mb-12">
          <Link
            to={AppRoute.Home}
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium mb-6 transition-colors"
          >
            ← Back to search
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                {countryDetails.countryName}
              </h1>
            </div>
            {countryDetails.flagUrl && (
              <img
                src={countryDetails.flagUrl}
                alt={`${countryDetails.countryName} flag`}
                className="w-16 h-12 object-cover rounded-lg shadow-md border border-gray-200"
              />
            )}
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Country details card */}
          <section className="bg-white rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-50/80 p-6 lg:p-8 hover:shadow-xl hover:shadow-blue-100/50 transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-2xl">🌍</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Country details
              </h2>
            </div>
            <dl className="space-y-4">
              <div>
                <dt className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
                  Capital
                </dt>
                <dd className="text-gray-800 font-medium">
                  {countryDetails.capitalCityName}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
                  Currency
                </dt>
                <dd className="text-gray-800 font-medium">
                  {countryDetails.currency.name}
                  {countryDetails.currency.symbol && (
                    <span className="text-gray-600 ml-1">
                      ({countryDetails.currency.symbol})
                    </span>
                  )}
                </dd>
              </div>
              {countryDetails.languages?.length > 0 && (
                <div>
                  <dt className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
                    Languages
                  </dt>
                  <dd className="text-gray-800 font-medium">
                    {countryDetails.languages.join(", ")}
                  </dd>
                </div>
              )}
            </dl>
          </section>

          {/* Map card */}
          <section className="bg-white rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-50/80 p-6 lg:p-8 hover:shadow-xl hover:shadow-blue-100/50 transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-2xl">🗺️</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Location</h2>
            </div>
            <div className="relative w-full h-64 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
              <iframe
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${countryDetails.coordinates.longitude - 3},${countryDetails.coordinates.latitude - 3},${countryDetails.coordinates.longitude + 3},${countryDetails.coordinates.latitude + 3}&layer=mapnik&marker=${countryDetails.coordinates.latitude},${countryDetails.coordinates.longitude}`}
                className="w-full h-full"
                style={{ border: 0 }}
                loading="lazy"
                title={`Map of ${countryDetails.countryName}`}
              />
            </div>
            <a
              href={countryDetails.maps.googleMaps}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              View in Google Maps
              <span className="text-xs">↗</span>
            </a>
          </section>

          {/* Earthquake stats card */}
          <section className="bg-white rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-50/80 p-6 lg:p-8 hover:shadow-xl hover:shadow-blue-100/50 transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-linear-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-2xl">🌋</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Earthquake activity
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50/60 rounded-xl p-4">
                <p className="text-2xl font-bold text-blue-700">
                  {earthquakeStatistics.totalEarthquakes}
                </p>
                <p className="text-sm text-gray-600">Total in {month}</p>
              </div>
              <div className="bg-blue-50/60 rounded-xl p-4">
                <p className="text-2xl font-bold text-blue-700">
                  {earthquakeStatistics.avgMagnitude?.toFixed(1) ?? "—"}
                </p>
                <p className="text-sm text-gray-600">Avg magnitude</p>
              </div>
            </div>
          </section>

          {/* National Dish card */}
          {countryData.nationalDish && (
            <section className="bg-white rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-50/80 p-6 lg:p-8 hover:shadow-xl hover:shadow-blue-100/50 transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-linear-to-br from-rose-500 to-red-600 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-2xl">🍽️</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  National Dish
                </h2>
              </div>
              <div className="space-y-4">
                {countryData.nationalDish.imageUrl && (
                  <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                    <img
                      src={countryData.nationalDish.imageUrl}
                      alt={countryData.nationalDish.dishName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {countryData.nationalDish.dishName}
                  </h3>
                  {countryData.nationalDish.description && (
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {countryData.nationalDish.description}
                    </p>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* City Populations card */}
          {countryData.cityPopulation &&
            countryData.cityPopulation.length > 0 && (
              <section className="bg-white rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-50/80 p-6 lg:p-8 hover:shadow-xl hover:shadow-blue-100/50 transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-linear-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                    <span className="text-2xl">🏙️</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Top Cities
                  </h2>
                </div>
                <ul className="space-y-3">
                  {[...countryData.cityPopulation]
                    .sort((a, b) => b.population - a.population)
                    .slice(0, 5)
                    .map((city, index) => (
                      <li
                        key={city.cityName}
                        className="flex items-center justify-between gap-4 p-4 bg-cyan-50/50 rounded-xl border border-cyan-100/60"
                      >
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-100 text-cyan-800 font-bold text-sm">
                            {index + 1}
                          </span>
                          <span className="text-gray-800 font-medium">
                            {city.cityName}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600 font-medium shrink-0">
                          {city.population.toLocaleString()}
                        </span>
                      </li>
                    ))}
                </ul>
              </section>
            )}

          {/* UNESCO sites - full width when present */}
          {tourismData.unescoSites.length > 0 && (
            <section className="lg:col-span-2 bg-white rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-50/80 p-6 lg:p-8 hover:shadow-xl hover:shadow-blue-100/50 transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-linear-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-2xl">🏛️</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  UNESCO World Heritage Sites
                </h2>
              </div>
              <ul className="grid sm:grid-cols-2 gap-3">
                {tourismData.unescoSites.map((site) => (
                  <li
                    key={site.site}
                    className="flex items-start gap-3 p-3 bg-blue-50/40 rounded-xl border border-blue-100/60"
                  >
                    <span className="text-lg shrink-0">✨</span>
                    <div>
                      <p className="font-medium text-gray-800">{site.site}</p>
                      {site.areaName && (
                        <p className="text-sm text-gray-500">{site.description}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Recent earthquakes - full width when present */}
          {earthquakeData.earthquakes.length > 0 && (
            <section className="lg:col-span-2 bg-white rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-50/80 p-6 lg:p-8 hover:shadow-xl hover:shadow-blue-100/50 transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-linear-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-2xl">📊</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Recent earthquakes
                </h2>
              </div>
              <ul className="space-y-3">
                {earthquakeData.earthquakes.slice(0, 5).map((eq) => (
                  <li
                    key={eq.id}
                    className="flex items-center justify-between gap-4 p-4 bg-amber-50/50 rounded-xl border border-amber-100/60"
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-amber-100 text-amber-800 font-bold text-sm">
                        M{eq.magnitude}
                      </span>
                      <span className="text-gray-800 font-medium">
                        {eq.location}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 shrink-0">
                      {new Date(eq.timestamp).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
