import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppRoute } from "./common/enums";
import { useAuth } from "./hooks/useAuth";
import { supabase } from "./lib/supabase";
import { fetchEarthquakeNotifications } from "./pages/api";
import { Navbar } from "./components/NavBar";
import type { NavButton } from "./components/NavBar";

const NOTIFICATION_POLL_INTERVAL_MS = 60_000;
const TOAST_VISIBLE_MS = 8_000;

type EarthquakeToast = {
  id: string;
  message: string;
};

function App() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const isLandingPage = routerState.location.pathname === AppRoute.Landing;
  const [toasts, setToasts] = useState<EarthquakeToast[]>([]);

  useEffect(() => {
    if (!user) {
      setToasts([]);
      return;
    }

    let isActive = true;

    const enqueueToast = (toast: EarthquakeToast) => {
      setToasts((current) => [...current, toast]);
      window.setTimeout(() => {
        setToasts((current) =>
          current.filter((currentToast) => currentToast.id !== toast.id),
        );
      }, TOAST_VISIBLE_MS);
    };

    const fetchNewAlerts = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const accessToken = session?.access_token;

        if (!accessToken || !isActive) {
          return;
        }

        const { newEvents } = await fetchEarthquakeNotifications(accessToken);

        if (!isActive) {
          return;
        }

        newEvents.forEach((earthquake) => {
          enqueueToast({
            id: `${earthquake.id}-${Date.now()}`,
            message: `New Earthquake: M${earthquake.magnitude}${
              earthquake.location ? ` near ${earthquake.location}` : ""
            }`,
          });
        });
      } catch (error) {
        console.error("Failed to fetch earthquake notifications", error);
      }
    };

    void fetchNewAlerts();
    const interval = window.setInterval(() => {
      void fetchNewAlerts();
    }, NOTIFICATION_POLL_INTERVAL_MS);

    return () => {
      isActive = false;
      window.clearInterval(interval);
    };
  }, [user]);

  const navButtons: NavButton[] = user
    ? [
        {
          label: user.email ?? "Account",
          onClick: () => {},
          variant: "secondary" as const,
        },
        {
          label: "Logout",
          onClick: () => {
            void navigate({ to: "/logout" });
          },
          variant: "accent" as const,
        },
      ]
    : [
        {
          label: "Login",
          onClick: () => {
            void navigate({ to: AppRoute.Login });
          },
          variant: "primary" as const,
        },
        {
          label: "Sign Up",
          onClick: () => {
            void navigate({ to: AppRoute.Signup });
          },
          variant: "secondary" as const,
        },
      ];

  return (
    <div className="min-h-screen">
      {!isLandingPage && (
        <Navbar
          buttons={navButtons}
          logoText="Destination App"
          onLogoClick={() => navigate({ to: AppRoute.Landing })}
        />
      )}
      <main>
        <Outlet />
      </main>
      <div className="fixed right-4 top-24 z-50 space-y-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="max-w-sm rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-medium text-orange-900 shadow-lg dark:border-orange-800 dark:bg-orange-900/30 dark:text-orange-100"
            role="status"
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
