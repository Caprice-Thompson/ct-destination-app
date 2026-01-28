import { useRouter } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import {
  mockLogin,
  mockSignup,
  type AuthResponse,
  type LoginCredentials,
  type SignupCredentials,
} from "../common/auth";
import { Auth } from "./Auth";

export function Login() {
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => mockLogin(credentials),
    onSuccess: async (data: AuthResponse) => {
      if (data.success) {
        await router.invalidate();
        router.navigate({ to: "/" });
      }
    },
  });

  const signupMutation = useMutation({
    mutationFn: (credentials: SignupCredentials) => mockSignup(credentials),
    onSuccess: async (data: AuthResponse) => {
      if (data.success) {
        await router.invalidate();
        router.navigate({ to: "/" });
      }
    },
  });

  return (
    <Auth
      actionText="Login"
      status={loginMutation.status}
      onSubmit={(e) => {
        const formData = new FormData(e.target as HTMLFormElement);

        loginMutation.mutate({
          email: formData.get("email") as string,
          password: formData.get("password") as string,
        });
      }}
      afterSubmit={
        loginMutation.data ? (
          <>
            <div className="text-red-400">{loginMutation.data.message}</div>
            {loginMutation.data.userNotFound ? (
              <div>
                <button
                  className="text-blue-500"
                  onClick={(e) => {
                    const formData = new FormData(
                      (e.target as HTMLButtonElement).form!,
                    );

                    signupMutation.mutate({
                      email: formData.get("email") as string,
                      password: formData.get("password") as string,
                    });
                  }}
                  type="button"
                >
                  Sign up instead?
                </button>
              </div>
            ) : null}
          </>
        ) : null
      }
    />
  );
}
