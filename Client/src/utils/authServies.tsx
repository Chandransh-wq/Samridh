// utils/authService.ts
import type { useNavigate } from "react-router-dom";
import { toast } from "./Toast";

export interface UserAuthData {
  name?: string;
  email: string;
  password: string;
}

const AUTH_KEY = "token"; // indicates logged-in

// Register
export const loginUser = (
  email: string,
  password: string,
  darkMode: boolean
) => {
  const stored = localStorage.getItem("appUser");
  if (!stored) return { success: false };

  const user = JSON.parse(stored);
  if (user.email !== email || user.password !== password)
    return { success: false };

  localStorage.setItem("token", "true"); // THIS IS CRUCIAL
  toast.success("Logged IN", "You have successfully logged in.", darkMode);
  return { success: true };
};

export const registerUser = (
  { name, email, password }: UserAuthData,
  darkMode: boolean
) => {
  localStorage.setItem("appUser", JSON.stringify({ name, email, password }));
  localStorage.setItem("token", "true"); // THIS IS CRUCIAL
  toast.success("Logged IN", "You have successfully logged in.", darkMode);
  return { success: true };
};

// Logout
export const logoutUser = (
  darkMode: boolean,
  navigate: ReturnType<typeof useNavigate>
) => {
  localStorage.setItem("token", "false"); // or AUTH_KEY
  toast.success("Logged Out", "You have logged out successfully", darkMode);
  navigate("/login"); // programmatically redirect
};
// Check login
export const isAuthenticated = () => {
  return localStorage.getItem(AUTH_KEY) === "true";
};
