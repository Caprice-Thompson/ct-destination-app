export const AppRoute = {
  Landing: "/",
  Home: "/home",
  Login: "/login",
  Signup: "/signup"
} as const;

export type AppRoute = (typeof AppRoute)[keyof typeof AppRoute];
