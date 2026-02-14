import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Auth from "./pages/Auth";
import ProtectedRoute from "./utils/ProtectedRoute";
import ToastProvider from "./Components/ToastProvider";
import "./App.css";
import SidebarLayout from "./utils/SidebarLayout";
import Map from "./exports/Map";
import Home from "./exports/Home";
import Folder from "./exports/Folder";
import { toast } from "./utils/Toast";

function App() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem("darkMode");
    return stored === "true" || stored === null;
  });

  useEffect(() => {
    localStorage.setItem("darkMode", `${darkMode}`);
  }, [darkMode]);

  // Auth Expiration Logic
  useEffect(() => {
    const expiresAt = localStorage.getItem("expiresAt");
    if (!expiresAt) return;

    const checkToken = () => {
      const currentTime = Date.now();
      const remainingTime = Number(expiresAt) - currentTime;

      if (remainingTime <= 0) {
        // Token is already expired
        handleLogout();
      } else {
        // Set a timer for the remaining duration
        const timer = setTimeout(() => {
          handleLogout();
        }, remainingTime);
        return timer;
      }
    };

    const handleLogout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("expiresAt");
      localStorage.removeItem("User");
      toast.success(
        "Logged-Out",
        "You have been logged-out due to user timeout.",
        darkMode,
      );
      navigate("/login");
    };

    const timerId = checkToken();
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [navigate]);

  return (
    <>
      <ToastProvider />
      <Routes>
        <Route path="/login" element={<Auth darkMode={darkMode} />} />

        <Route element={<ProtectedRoute />}>
          <Route
            element={
              <SidebarLayout
                darkMode={darkMode}
                setDarkMode={() => setDarkMode((prev) => !prev)}
              />
            }
          >
            <Route path="/" element={<Home darkMode={darkMode} />} />
            <Route path="/folder" element={<Folder darkMode={darkMode} />} />
            <Route path="/map" element={<Map darkMode={darkMode} />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
