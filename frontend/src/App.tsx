import { Outlet } from "@tanstack/react-router";
import { getCurrentUser, logout } from "./common/auth";
import "./App.css";

function App() {
  const user = getCurrentUser();

  return (
    <div className="min-h-screen">
      <header className="p-4 bg-gray-100 dark:bg-gray-800 border-b">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Destination App</h1>
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm">{user}</span>
              <button
                onClick={() => {
                  logout();
                  window.location.href = "/login";
                }}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
