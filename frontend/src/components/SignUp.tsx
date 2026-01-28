import { useMutation } from "@tanstack/react-query";
import { Auth } from "./Auth";
import { useRouter } from "@tanstack/react-router";
import { mockSignup, type AuthResponse, type SignupCredentials } from "../common/auth";

export default function SignupComp() {
  const router = useRouter();

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
      actionText="Sign Up"
      status={signupMutation.status}
      onSubmit={(e) => {
        const formData = new FormData(e.target as HTMLFormElement);

        signupMutation.mutate({
          email: formData.get("email") as string,
          password: formData.get("password") as string,
        });
      }}
      afterSubmit={
        signupMutation.data?.error ? (
          <>
            <div className="text-red-400">{signupMutation.data.message}</div>
          </>
        ) : null
      }
    />
  );
}