import { useRouter } from "@tanstack/react-router";
import { AppRoute } from "../common/enums";
import { europeanCountries } from "../common/constants";
import { FormHeader } from "../components/FormHeader";
import { Button } from "../components/Button";

export function Landing() {
  const router = useRouter();

  const handleGuestAccess = () => {
    router.navigate({ to: AppRoute.Home });
  };

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left Side - 3/4 width with blue background */}
      <div className="w-3/4 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center h-full px-16">
          <div className="max-w-2xl">
            <h1 className="text-7xl font-bold text-white mb-6 leading-tight">
              Destination
              <br />
              <span className="text-blue-200">Explorer</span>
            </h1>
            <p className="text-2xl text-blue-100 mb-8 leading-relaxed">
              Discover breathtaking destinations, explore hidden gems, and plan
              your next adventure around the globe.
            </p>
            <div className="flex items-center space-x-4 text-white">
              <div className="flex items-center space-x-2">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl">🌍</span>
                </div>
                <span className="text-lg">
                  {europeanCountries.length} Countries
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl">🏛️</span>
                </div>
                <span className="text-lg">UNESCO Sites</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl">🌋</span>
                </div>
                <span className="text-lg">Live Data</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - 1/4 width with light blue background */}
      <div className="w-1/4 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-8 relative">
        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full -mr-16 -mt-16 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-300 rounded-full -ml-12 -mb-12 opacity-50"></div>

        {/* Auth Container */}
        <div className="relative z-10 w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center transform rotate-3 shadow-lg">
                <span className="text-3xl">✈️</span>
              </div>
              <FormHeader
                title="Welcome"
                description="Start your journey today"
              />
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                variant="primary"
                onClick={() => router.navigate({ to: AppRoute.Login })}
                className="w-full"
              >
                Login
              </Button>
              <Button
                type="submit"
                variant="secondary"
                onClick={() => router.navigate({ to: AppRoute.Signup })}
                className="w-full"
              >
                Create Account
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              <Button
                type="submit"
                variant="secondary"
                onClick={handleGuestAccess}
                className="w-full"
              >
                Continue as Guest
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center leading-relaxed">
                Save favorite destinations and get personalised recommendations
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
