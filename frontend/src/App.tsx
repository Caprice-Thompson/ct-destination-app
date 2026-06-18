import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppRoute } from "./common/enums";
import { useAuth } from "./hooks/useAuth";
import { supabase } from "./lib/supabase";
import {
  fetchEarthquakeNotifications,
  type EarthquakeNotificationData,
} from "./pages/api";
import { Navbar } from "./components/NavBar";
import type { NavButton } from "./components/NavBar";

const NOTIFICATION_POLL_INTERVAL_MS = 60_000;

function App() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const isLandingPage = routerState.location.pathname === AppRoute.Landing;
  const [notifications, setNotifications] = useState<
    EarthquakeNotificationData[]
  >([]);

  useEffect(() => {
    if (!user) return;

    let isActive = true;

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

        if (!isActive || newEvents.length === 0) {
          return;
        }

        setNotifications((current) => {
          const existingIds = new Set(current.map((n) => n.id));
          const fresh = newEvents.filter((e) => !existingIds.has(e.id));
          return fresh.length > 0 ? [...fresh, ...current] : current;
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
      setNotifications([]);
    };
  }, [user]);

  const dismissNotification = (id: string) => {
    setNotifications((current) => current.filter((n) => n.id !== id));
  };

  const dismissAllNotifications = () => {
    setNotifications([]);
  };

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
          notifications={user ? notifications : undefined}
          onDismissNotification={user ? dismissNotification : undefined}
          onDismissAllNotifications={user ? dismissAllNotifications : undefined}
        />
      )}
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
