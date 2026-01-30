import { Outlet, Link, useRouterState } from "@tanstack/react-router";
import { useAuth } from "./hooks/useAuth";
import { AppRoute } from "./common/enums";
import "./App.css";

function App() {
  const { user } = useAuth();
  const routerState = useRouterState();
  const isLandingPage = routerState.location.pathname === AppRoute.Landing;

  return (
    <div className="min-h-screen">
      {!isLandingPage && (
        <header className="p-4 bg-gray-100 dark:bg-gray-800 border-b">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link to={user ? AppRoute.Home : AppRoute.Landing}>
              <h1 className="text-xl font-bold hover:text-blue-600 transition-colors">
                Destination App
              </h1>
            </Link>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <span className="text-sm">{user.email}</span>
                  <Link
                    to="/logout"
                    className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                  >
                    Logout
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to={AppRoute.Login}
                    className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to={AppRoute.Signup}
                    className="px-4 py-2 text-sm bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>
      )}
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
