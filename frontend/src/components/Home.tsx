import { useAuth } from "../hooks/useAuth";
import Dropdown from "./Dropdown";

export function Home() {
  const { user } = useAuth();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        {/* {user ? (
          <p className="text-lg text-green-600 dark:text-green-400">
            You are logged in as {user.email}
          </p>
        ) : (
          <p className="text-lg text-gray-600 dark:text-gray-400">
            You are browsing as a guest
          </p>
        )} */}
      </div>
      <div className="space-y-4">
        <div className="text-gray-600 dark:text-gray-300">
          <p className="text-lg mb-4">
            Start exploring destinations around the world.
          </p>
          {!user && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Tip:</strong> Create an account to save your favorite
                destinations and get personalised recommendations!
              </p>
            </div>
          )}
          <Dropdown
            id="country"
            name="country"
            className="w-full p-2 border border-gray-300 rounded-md"
            options={[{ value: "United States", label: "January" }, { value: "Canada", label: "February" }, { value: "United Kingdom", label: "March" }, { value: "Australia", label: "April" }, { value: "New Zealand", label: "May" }]}
            label="Select a country"
            value="January"
          />

          <p>Select a country from the list</p>
          <select className="w-full p-2 border border-gray-300 rounded-md" >
            <option value="United States">United States</option>
            <option value="Canada">Canada</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Australia">Australia</option>
            <option value="New Zealand">New Zealand</option>
          </select>
          <button className="w-full p-2 bg-blue-500 text-white rounded-md">Search</button>
        </div>
      </div>
    </div>
  );
}
