import { createRoute, redirect } from "@tanstack/react-router";
import { AppRoute } from "../common/enums";
import { rootRoute } from "./routes";
import { Landing } from "../pages/Landing";
import { supabase } from "../lib/supabase";

export const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: AppRoute.Landing,
  component: Landing,
  beforeLoad: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      throw redirect({ to: AppRoute.Home });
    }
  },
});
