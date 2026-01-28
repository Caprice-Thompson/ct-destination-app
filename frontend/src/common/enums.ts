export const AppRoute = {
  Home: "/",
  Login: "/login",
  Signup: "/signup",
} as const;

export type AppRoute = (typeof AppRoute)[keyof typeof AppRoute];
