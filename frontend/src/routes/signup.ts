import { createRoute, redirect } from "@tanstack/react-router";
import { AppRoute } from "../common/enums";
import { supabase } from "../lib/supabase";
import { SignUpPage } from "../pages/SignUp";
import { rootRoute } from "./routes";

export const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: AppRoute.Signup,
  component: SignUpPage,
  beforeLoad: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      throw redirect({ to: AppRoute.Home });
    }
  },
});
