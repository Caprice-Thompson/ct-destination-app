import { createRoute, redirect } from "@tanstack/react-router";
import { rootRoute } from "./routes";
import { supabase } from "../lib/supabase";
import { AppRoute } from "../common/enums";

export const logoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/logout",
  loader: async () => {
    await supabase.auth.signOut();
    throw redirect({ to: AppRoute.Landing });
  },
});
