import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { AppRoute } from "./common/enums";
import { useAuth } from "./hooks/useAuth";
import { Navbar } from "./components/NavBar";
import type { NavButton } from "./components/NavBar";

function App() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const isLandingPage = routerState.location.pathname === AppRoute.Landing;

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
    </div>
  );
}

export default App;
