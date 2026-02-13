import { toast } from "../../utils/Toast";
import { publicApi, apiRequest } from "./basic";
import { type NavigateFunction } from "react-router-dom"; // Import the type

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

export interface login {
  email: string;
  password: string;
}

export interface register {
  email: string;
  username: string;
  password: string;
  avatarURL?: string;
}

// Accept 'navigate' as the second argument
export const loginUser = async (
  credentials: login,
  navigate: NavigateFunction,
  darkMode: boolean
) => {
  const res = await apiRequest<AuthResponse>(
    publicApi,
    "post",
    "/auth/login",
    credentials
  );

  toast.success("Logged IN", "You have successfully logged IN", darkMode);
  localStorage.setItem("token", res.token);
  localStorage.setItem("User", JSON.stringify(res.user));

  // Now you can use it here
  navigate("/");
};

export const registerUser = async (
  credentials: register,
  navigate: NavigateFunction,
  darkMode: boolean
) => {
  console.log(credentials);
  const res = await apiRequest<AuthResponse>(
    publicApi,
    "post",
    "/auth/register",
    credentials
  );

  toast.success(
    "Registered and Logged IN",
    "You have successfully been registered and logged IN",
    darkMode
  );
  console.log(res);
  localStorage.setItem("token", res.token);
  localStorage.setItem("User", JSON.stringify(res.user));

  // Now you can use it here
  navigate("/");
};
