// utils/authService.ts
import type { useNavigate } from "react-router-dom";
import { toast } from "./Toast";

export interface UserAuthData {
  name?: string;
  email: string;
  password: string;
}

const AUTH_KEY = "token"; // indicates logged-in

// Logout
export const logoutUser = (
  darkMode: boolean,
  navigate: ReturnType<typeof useNavigate>,
) => {
  localStorage.setItem("token", ""); // or AUTH_KEY
  toast.success("Logged Out", "You have logged out successfully", darkMode);
  navigate("/login"); // programmatically redirect
};
// Check login
export const isAuthenticated = () => {
  return localStorage.getItem(AUTH_KEY) === "true";
};
