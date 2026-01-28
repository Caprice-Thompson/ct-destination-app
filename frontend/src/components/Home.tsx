import { Link } from "@tanstack/react-router";
import { getCurrentUser } from "../common/auth";

export function Home() {
  const user = getCurrentUser();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Welcome to Destination App</h1>

      {user ? (
        <div className="space-y-4">
          <p className="text-lg">
            You are logged in as: <strong>{user}</strong>
          </p>
          <div className="text-gray-600">
            <p>Start exploring destinations around the world.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-lg">Please log in to access the application.</p>
          <div className="flex gap-4">
            <Link
              to="/login"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
