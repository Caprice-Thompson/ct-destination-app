export const AppRoute = {
  Landing: "/",
  Home: "/home",
  Dashboard: "/dashboard",
  Login: "/login",
  Signup: "/signup",
} as const;

export type AppRoute = (typeof AppRoute)[keyof typeof AppRoute];
