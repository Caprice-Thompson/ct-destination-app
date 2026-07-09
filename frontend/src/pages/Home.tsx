import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { europeanCountries, months } from "../common/constants";
import { AppRoute } from "../common/enums";
import { Button } from "../components/Button";
import Dropdown from "../components/Dropdown";
import { useAuth } from "../hooks/useAuth";
import { searchAPI, searchQueryKeys } from "./api";
import { FormContainer } from "../components/FormContainer";
import { FormHeader } from "../components/FormHeader";

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
      <div className="space-y-8">
        <FormContainer onSubmit={handleSearch}>
          <FormHeader title="Start exploring destinations around the world!"/>
          <div className="text-gray-600 dark:text-gray-300">

            {!user && (
              <div className="mt-8 mb-10 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/50 shadow-sm">
                <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">
                  <strong className="font-semibold">Tip:</strong> Create an
                  account to save your favourite destinations and get
                  personalised recommendations!
                </p>
              </div>
            )}

            <div className="space-y-8 mt-10">
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
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-800 dark:text-red-200">
                  {error}
                </p>
              </div>
            )}

            <div className="mt-6">
              <Button
                className="w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                onClick={handleSearch}
                disabled={
                  mutation.isPending || !selectedCountry || !selectedMonth
                }
              >
                {mutation.isPending ? "Searching..." : "Search"}
              </Button>
            </div>
          </div>
        </FormContainer>
      </div>
    </div>
  );
}
