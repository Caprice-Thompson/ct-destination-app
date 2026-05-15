import { createRoute, redirect } from "@tanstack/react-router";
import { AppRoute } from "../common/enums";
import { supabase } from "../lib/supabase";
import { rootRoute } from "./routes";

export const logoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/logout",
  loader: async () => {
    await supabase.auth.signOut();
    throw redirect({ to: AppRoute.Landing });
  },
});
