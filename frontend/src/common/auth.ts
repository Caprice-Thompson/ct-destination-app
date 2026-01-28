const AUTH_TOKEN_KEY = "auth_token";
const USER_EMAIL_KEY = "user_email";

export interface AuthResponse {
  success: boolean;
  token?: string;
  email?: string;
  error?: boolean;
  message?: string;
  userNotFound?: boolean;
  userExists?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
}

export const mockLogin = async (
  credentials: LoginCredentials,
): Promise<AuthResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const storedUsers = localStorage.getItem("users");
  const users = storedUsers ? JSON.parse(storedUsers) : {};

  if (!users[credentials.email]) {
    return {
      success: false,
      error: true,
      userNotFound: true,
      message: "User not found",
    };
  }

  if (users[credentials.email] !== credentials.password) {
    return {
      success: false,
      error: true,
      message: "Invalid password",
    };
  }

  const token = btoa(`${credentials.email}:${Date.now()}`);
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(USER_EMAIL_KEY, credentials.email);

  return {
    success: true,
    token,
    email: credentials.email,
  };
};

export const mockSignup = async (
  credentials: SignupCredentials,
): Promise<AuthResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const storedUsers = localStorage.getItem("users");
  const users = storedUsers ? JSON.parse(storedUsers) : {};

  if (users[credentials.email]) {
    return {
      success: false,
      error: true,
      userExists: true,
      message: "User already exists",
    };
  }

  users[credentials.email] = credentials.password;
  localStorage.setItem("users", JSON.stringify(users));

  const token = btoa(`${credentials.email}:${Date.now()}`);
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(USER_EMAIL_KEY, credentials.email);

  return {
    success: true,
    token,
    email: credentials.email,
  };
};

export const logout = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USER_EMAIL_KEY);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

export const getCurrentUser = (): string | null => {
  return localStorage.getItem(USER_EMAIL_KEY);
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};
