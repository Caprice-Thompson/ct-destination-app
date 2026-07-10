import { createRoute } from "@tanstack/react-router";
import { AppRoute } from "../common/enums";
import { Dashboard } from "../pages/Dashboard/Dashboard";
import { rootRoute } from "./routes";

export const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: AppRoute.Dashboard,
  component: Dashboard,
  validateSearch: (search: Record<string, unknown>) => ({
    country: (search.country as string) ?? "",
    month: (search.month as string) ?? "",
  }),
});
