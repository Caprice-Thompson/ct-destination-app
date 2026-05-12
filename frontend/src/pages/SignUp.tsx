import { useState } from "react";
import { AppRoute } from "../common/enums";
import { AuthFormFooter } from "../components/AuthFormFooter";
import { Button } from "../components/Button";
import { FormHeader } from "../components/FormHeader";
import { Input } from "../components/Input";
import { supabase } from "../lib/supabase";
import { FormContainer } from "../components/FormContainer";

export const SignUpPage = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { displayName } },
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Check your email for the confirmation link!");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <FormHeader
          title="Create your account"
          description="Sign up to save your favorite destinations"
          className="font-extrabold"
        />
        <FormContainer onSubmit={handleAuth}>
          <div>
            <div>
              <Input
                label="Display Name"
                type="text"
                placeholder="Enter a display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required={true}
                dataTestId="displayName"
              />
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
            </div>
            <div>
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
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full py-2 px-4">
            {loading ? "Processing..." : "Sign Up"}
          </Button>

          <AuthFormFooter
            message="Already have an account?"
            link={AppRoute.Login}
            linkText="Sign in instead"
            returnLink={AppRoute.Landing}
            returnLinkText="Back to landing"
          />
        </FormContainer>
      </div>
    </div>
  );
};
