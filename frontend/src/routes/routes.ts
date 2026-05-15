import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import App from "../App";
import { AppRoute } from "../common/enums";
import { DefaultCatchBoundary } from "../components/DefaultCatchBoundary";
import { Home } from "../pages/Home";
import { dashboardRoute } from "./dashboard";
import { landingRoute } from "./landing";
import { loginRoute } from "./login";
import { logoutRoute } from "./logout";
import { signupRoute } from "./signup";

function RootNotFound() {
  return redirect({ to: AppRoute.Landing, replace: true });
}

export const rootRoute = createRootRoute({ component: App });
export const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: AppRoute.Home,
  component: Home,
});

const routeTree = rootRoute.addChildren([
  landingRoute,
  homeRoute,
  dashboardRoute,
  loginRoute,
  signupRoute,
  logoutRoute,
]);

export function getRouter() {
  const router = createRouter({
    routeTree,
    defaultPreload: "intent",
    defaultErrorComponent: DefaultCatchBoundary,
    defaultNotFoundComponent: RootNotFound,
    scrollRestoration: true,
  });

  return router;
}
