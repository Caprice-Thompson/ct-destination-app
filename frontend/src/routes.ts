import { createRootRoute, createRoute, createRouter, redirect } from "@tanstack/react-router";
import App from "./App";
import { DefaultCatchBoundary } from "./components/DefaultCatchBoundary";
// look at ui 
function RootNotFound() {
  return redirect({ to: "/", replace: true });
}

export const rootRoute = createRootRoute({ component: App });
export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  loader: () => {
    redirect({
      to: "/",
      throw: true,
    });
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
]);

export function getRouter() {
  const router = createRouter({
    routeTree,
    defaultPreload: 'intent',
    defaultErrorComponent: DefaultCatchBoundary,
    defaultNotFoundComponent: RootNotFound,
    scrollRestoration: true,
  })

  return router
}
