import { createRoute, redirect } from "@tanstack/react-router";
import { AppRoute } from "../common/enums";
import { Login } from "../components/Login";
import { supabase } from "../lib/supabase";
import { rootRoute } from "./routes";

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: AppRoute.Login,
  component: Login,
  beforeLoad: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      throw redirect({ to: AppRoute.Home });
    }
  },
});
