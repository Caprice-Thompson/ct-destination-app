import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import App from "../App";
import { Home } from "../components/Home";
import { DefaultCatchBoundary } from "../components/DefaultCatchBoundary";
import { loginRoute } from "./login";
import { signupRoute } from "./signup";
import { logoutRoute } from "./logout";
import { landingRoute } from "./landing";
import { AppRoute } from "../common/enums";

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
