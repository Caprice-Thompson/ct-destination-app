import { useQuery } from "@tanstack/react-query";
import { useSearch as useRouterSearch } from "@tanstack/react-router";
import { type SearchResult, searchAPI, searchQueryKeys } from "../api/api";
import { dashboardRoute } from "../routes/dashboard";

export function useSearch() {
  const { country, month } = useRouterSearch({ from: dashboardRoute.id });

  const query = useQuery<SearchResult>({
    queryKey: searchQueryKeys.detail({ country, month }),
    queryFn: () => searchAPI({ country, month }),
    enabled: Boolean(country && month),
  });

  return {
    ...query,
    country,
    month,
  };
}
