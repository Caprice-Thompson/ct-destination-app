import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import App from "../App";
import { Home } from "../components/Home";
import { DefaultCatchBoundary } from "../components/DefaultCatchBoundary";
import loginRoute from "./login";
import { signupRoute } from "./signup";

function RootNotFound() {
  return redirect({ to: "/", replace: true });
}

export const rootRoute = createRootRoute({ component: App });
export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute(rootRoute),
  signupRoute,
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
