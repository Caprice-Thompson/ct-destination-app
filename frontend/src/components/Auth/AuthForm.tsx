import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { AppRoute } from "../../common/enums";
import { supabase } from "../../lib/supabase";
import { Button } from "../UI/Button";
import { Input } from "../UI/Input";
import { AuthFormFooter } from "./AuthFormFooter";
import { FormContainer } from "./FormContainer";
import { FormHeader } from "./FormHeader";

interface AuthFormProps {
  mode?: "login" | "signup";
}

export const AuthForm = ({ mode = "login" }: AuthFormProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const isSignUp = mode === "signup";

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = isSignUp
      ? await supabase.auth.signUp({
          email,
          password,
          options: { data: { displayName } },
        })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(error.message);
    } else if (isSignUp) {
      alert("Check your email for the confirmation link!");
    } else {
      // Redirect to home after successful login
      router.navigate({ to: AppRoute.Home });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <FormHeader
          title={isSignUp ? "Create your account" : "Welcome back"}
          description={
            isSignUp
              ? "Sign up to save your favorite destinations and have access to exclusive features"
              : "Sign in to your account"
          }
          className="font-extrabold"
        />
        <FormContainer onSubmit={handleAuth}>
          <div className="space-y-4">
            {isSignUp && (
              <Input
                label="Display Name"
                type="text"
                placeholder="Enter a display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required={true}
                dataTestId="displayName"
              />
            )}
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required={true}
              dataTestId="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={true}
              dataTestId="password"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 mt-4"
          >
            {loading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
          </Button>

          <AuthFormFooter
            message={
              isSignUp ? "Already have an account?" : "Don't have an account?"
            }
            link={isSignUp ? AppRoute.Login : AppRoute.Signup}
            linkText={isSignUp ? "Sign in instead" : "Create an account"}
            returnLink={AppRoute.Landing}
            returnLinkText="Back to landing"
          />
        </FormContainer>
      </div>
    </div>
  );
};
