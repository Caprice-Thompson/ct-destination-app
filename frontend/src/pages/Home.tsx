import { useState } from "react";
import { europeanCountries, months } from "../common/constants";
import { useAuth } from "../hooks/useAuth";
import Dropdown from "../components/Dropdown";
import { Button } from "../components/Button";
import {
  fetchCountryData,
  fetchTourismData,
  fetchEarthquakeData,
  fetchEarthquakeStatistics,
} from "./api";

export function Home() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!selectedCountry || !selectedMonth) {
      setError("Please select both a country and a month");
      return;
    }

    setIsLoading(true);
    setError(null);
    // not sure about promise all
    try {
      // Call all microservices in parallel with country name and month
      const [countryData, tourismData, earthquakeData, earthquakeStats] =
        await Promise.all([
          fetchCountryData(selectedCountry),
          fetchTourismData(selectedCountry),
          fetchEarthquakeData(selectedCountry, selectedMonth),
          fetchEarthquakeStatistics(selectedCountry, selectedMonth),
        ]);

      console.log("Country Data:", countryData);
      console.log("Tourism Data:", tourismData);
      console.log("Earthquake Data:", earthquakeData);
      console.log("Earthquake Statistics:", earthquakeStats);

      // TODO: Handle the results (e.g., navigate to results page, update state, etc.)
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        {/* {user ? (
          <p className="text-lg text-green-600 dark:text-green-400">
            You are logged in as {user.email}
          </p>
        ) : (
          <p className="text-lg text-gray-600 dark:text-gray-400">
            You are browsing as a guest
          </p>
        )} */}
      </div>
      <div className="space-y-4">
        <div className="text-gray-600 dark:text-gray-300">
          <p className="text-lg mb-4">
            Start exploring destinations around the world.
          </p>
          {!user && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Tip:</strong> Create an account to save your favorite
                destinations and get personalised recommendations!
              </p>
            </div>
          )}
          <p className="text-gray-600 text-sm">Select a month</p>
          <Dropdown
            name="month"
            className="w-full p-2 border border-gray-300 rounded-md"
            options={months}
            label="Choose a month..."
            onChange={(e) => setSelectedMonth(e.target.value)}
            value={selectedMonth}
          />

          <p>Select a country from the list</p>
          <Dropdown
            name="country"
            className="w-full p-2 border border-gray-300 rounded-md"
            options={europeanCountries}
            label="Choose a country..."
            onChange={(e) => setSelectedCountry(e.target.value)}
            value={selectedCountry}
          />

          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <Button
            className="w-full p-2 bg-blue-500 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            onClick={handleSearch}
            disabled={isLoading || !selectedCountry || !selectedMonth}
          >
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>
    </div>
  );
}
