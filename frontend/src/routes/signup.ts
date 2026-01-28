import { createRoute } from "@tanstack/react-router";
import { AppRoute } from "../common/enums";
import { rootRoute } from "./routes";
import SignupComp from "../components/SignUp";

export const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: AppRoute.Signup,
  component: SignupComp,
});
