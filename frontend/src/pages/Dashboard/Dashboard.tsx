import { BsBuildings } from "react-icons/bs";
import { FaGlobeAmericas } from "react-icons/fa";
import { GiKnifeFork } from "react-icons/gi";
import { WiDaySunny, WiEarthquake } from "react-icons/wi";
import { convertMonthValue } from "../../common/helper";
import { DashboardFooter } from "../../components/Dashboard/DashboardFooter";
import { DashboardHeader } from "../../components/Dashboard/DashboardHeader";
import { DataRow } from "../../components/Dashboard/DataRow";
import { InfoCard } from "../../components/Dashboard/InfoCard";
import { StatCard } from "../../components/Dashboard/StatCard";
import { TextTitle } from "../../components/Dashboard/TextTitle";
import { FailureDialog } from "../../components/Errors/FailureDialog";
import { ResponseDialog } from "../../components/Errors/ResponseDialog";
import { Pill } from "../../components/UI/Pill";
import { useAuth } from "../../hooks/useAuth";
import { useSearch } from "../../hooks/useSearch";

export function Dashboard() {
  const { data, isLoading, error, country, month } = useSearch();
  const { isAuthenticated } = useAuth();

  if (!country || !month) {
    return (
      <ResponseDialog
        title="No search parameters"
        message="Select a country and month from the home page to explore."
        confirmButtonText="Start Exploring"
      />
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
      <FailureDialog
        title="Something went wrong"
        message="We couldn't load the data. Please try again."
        retryButtonText="Try Again"
      />
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
      <DashboardHeader isAuthenticated={isAuthenticated} />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-start justify-between gap-6 mb-10 pb-10 border-b border-slate-200">
          <div>
            <Pill description={convertMonthValue(month)} />
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
          <TextTitle description="Country Overview" />
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
                <DataRow
                  label="Time Zone"
                  value={countryDetails.timezone?.join(", ") || "N/A"}
                />
                <DataRow
                  label="Driving Side"
                  value={
                    countryDetails.drivingSide === "left" ? "Left" : "Right"
                  }
                />
                <DataRow
                  label="Calling Code"
                  value={
                    (countryDetails.callingCodes ?? [])
                      .map((c) => `+${c}`)
                      .join(", ") || "N/A"
                  }
                />
                <DataRow
                  label="Capital City"
                  value={countryDetails.capitalCityName}
                />
                <DataRow
                  label="Popular Cities"
                  value={topCities.join(", ") || "N/A"}
                />
                <DataRow
                  label="EU Member"
                  value={countryDetails.europeanUnionMember ? "Yes" : "No"}
                />
                <DataRow
                  label="Schengen Area"
                  value={countryDetails.schengenAreaMember ? "Yes" : "No"}
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
            <TextTitle description="UNESCO World Heritage" />
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
        {weatherSummary && weatherSummary.totalWeatherRecords > 0 && (
          <section className="mb-10">
            <TextTitle description="Climate & Seismic" />
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
                          {earthquakeStatistics.avgMagnitude?.toFixed(1) ||
                            "N/A"}
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
        )}

        {/* Recent seismic events */}
        {earthquakeData && (
          <section className="mb-10">
            <TextTitle description="Recent Seismic Events" />
            <InfoCard
              title={`${country}'s Most Recent Earthquakes`}
              icon={<WiEarthquake />}
              iconBg="bg-amber-500"
            >{earthquakeData.earthquakes.length === 0 ? (
              <p className="text-sm text-slate-500">
                No recent earthquakes recorded in {country} for the last 25 years.
              </p>
            ) : (
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
            )}
          </InfoCard>
        </section>
      )}

        <DashboardFooter />
      </div>
    </div>
  );
}
