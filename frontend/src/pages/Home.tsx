import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { europeanCountries, months } from "../common/constants";
import { useAuth } from "../hooks/useAuth";
import Dropdown from "../components/Dropdown";
import { Button } from "../components/Button";
import { searchAPI, searchQueryKeys } from "./api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AppRoute } from "../common/enums";

export function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: searchAPI,
    onSuccess: (data, variables) => {
      queryClient.setQueryData(searchQueryKeys.detail(variables), data);
      navigate({
        to: AppRoute.Dashboard,
        search: { country: variables.country, month: variables.month },
      });
    },
    onError: () => {
      setError("Failed to fetch data. Please try again.");
    },
  });

  const handleSearch = () => {
    if (!selectedCountry || !selectedMonth) {
      setError("Please select both a country and a month");
      return;
    }

    setError(null);
    mutation.mutate({ country: selectedCountry, month: selectedMonth });
  };
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        {user ? (
          <p className="text-lg text-green-600 dark:text-green-400">
            You are logged in as {user.user_metadata.display_name}
          </p>
        ) : (
          <p className="text-lg text-gray-600 dark:text-gray-400">
            You are browsing as a guest
          </p>
        )}
      </div>
      <div className="space-y-8">
        <div className="text-gray-600 dark:text-gray-300">
          <p className="text-2xl font-light mb-8 text-gray-800 dark:text-gray-200">
            Start exploring destinations around the world.
          </p>
          {!user && (
            <div className="mt-8 mb-10 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/50 shadow-sm">
              <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">
                <strong className="font-semibold">Tip:</strong> Create an
                account to save your favorite destinations and get personalised
                recommendations!
              </p>
            </div>
          )}

          <div className="space-y-8 mt-10">
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 tracking-wide uppercase">
                Select the month you want to explore
              </p>
              <Dropdown
                name="month"
                className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                options={months}
                label="Choose a month..."
                onChange={(e) => setSelectedMonth(e.target.value)}
                value={selectedMonth}
              />
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 tracking-wide uppercase">
                Select the country you want to travel to
              </p>
              <Dropdown
                name="country"
                className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                options={europeanCountries}
                label="Choose a country..."
                onChange={(e) => setSelectedCountry(e.target.value)}
                value={selectedCountry}
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <div className="mt-6">
            <Button
              className="w-full p-2 bg-blue-500 text-white rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              onClick={handleSearch}
              disabled={mutation.isPending || !selectedCountry || !selectedMonth}
            >
              {mutation.isPending ? "Searching..." : "Search"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
