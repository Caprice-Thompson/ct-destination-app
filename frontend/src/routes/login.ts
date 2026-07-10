import { createRoute, redirect } from "@tanstack/react-router";
import { AppRoute } from "../common/enums";
import { supabase } from "../lib/supabase";
import { LoginPage } from "../pages/Login/Login";
import { rootRoute } from "./routes";

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: AppRoute.Login,
  component: LoginPage,
  beforeLoad: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      throw redirect({ to: AppRoute.Home });
    }
  },
});
