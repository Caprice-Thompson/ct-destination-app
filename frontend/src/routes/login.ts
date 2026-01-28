import { createRoute } from "@tanstack/react-router";
import { AppRoute } from "../common/enums";
import { Login } from "../components/Login";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function loginRoute(parentRoute: any) {
  return createRoute({
    getParentRoute: () => parentRoute,
    path: AppRoute.Login,
    component: Login,
  });
}
