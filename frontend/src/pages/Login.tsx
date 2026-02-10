import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { supabase } from "../lib/supabase";
import { AppRoute } from "../common/enums";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { FormHeader } from "../components/FormHeader";
import { AuthFormFooter } from "../components/AuthFormFooter";

export const LoginPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      router.navigate({ to: AppRoute.Home });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <FormHeader
          title="Welcome back"
          description="Sign in to your account"
        />
        <form
          onSubmit={handleAuth}
          className="mt-8 space-y-6 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md"
        >
          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            required={true}
            dataTestId="email"
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            required={true}
            dataTestId="password"
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4"
          >
            {loading ? "Processing..." : "Sign In"}
          </Button>

          <AuthFormFooter
            message="Don't have an account?"
            link={AppRoute.Signup}
            linkText="Create an account"
            returnLink={AppRoute.Landing}
            returnLinkText="Back to landing"
          />
        </form>
      </div>
    </div>
  );
};
