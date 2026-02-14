import { publicApi, apiRequest } from "./basic";
import { type NavigateFunction } from "react-router-dom";
import { toast } from "../../utils/Toast";

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
  message?: string; // Added to catch backend messages
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

const FIVE_HOURS_MS = 5 * 60 * 60 * 1000; // Testing with 30s as requested earlier

export const loginUser = async (
  credentials: login,
  navigate: NavigateFunction,
  darkMode: boolean,
) => {
  try {
    const res = await apiRequest<AuthResponse>(
      publicApi,
      "post",
      "/auth/login",
      credentials,
    );

    const expireTime = Date.now() + FIVE_HOURS_MS;

    localStorage.setItem("token", res.token);
    localStorage.setItem("User", JSON.stringify(res.user));
    localStorage.setItem("expiresAt", expireTime.toString());

    toast.success("Logged IN", "You have successfully logged IN", darkMode);
    navigate("/");
  } catch (error: any) {
    // This catches "User not found", "Invalid Password", or Server Errors
    const errorMessage =
      error.response?.data?.message || "Login failed. Please try again.";
    toast.error("Login Error", errorMessage, darkMode);
    console.error("Login Error:", error);
  }
};

export const registerUser = async (
  credentials: register,
  navigate: NavigateFunction,
  darkMode: boolean,
) => {
  try {
    const res = await apiRequest<AuthResponse>(
      publicApi,
      "post",
      "/auth/register",
      credentials,
    );

    const expireTime = Date.now() + FIVE_HOURS_MS;

    localStorage.setItem("token", res.token);
    localStorage.setItem("User", JSON.stringify(res.user));
    localStorage.setItem("expiresAt", expireTime.toString());

    toast.success(
      "Registered and Logged IN",
      "You have successfully been registered and logged IN",
      darkMode,
    );
    navigate("/");
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Registration failed.";
    toast.error("Registration Error", errorMessage, darkMode);
    console.error("Registration Error:", error);
  }
};
