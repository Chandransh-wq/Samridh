import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import ProtectedRoute from "./utils/ProtectedRoute";
import ToastProvider from "./Components/ToastProvider";
import "./App.css";
import SidebarLayout from "./utils/SidebarLayout";
import Map from "./exports/Map";
import Home from "./exports/Home";
import Folder from "./exports/Folder";

function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem("darkMode");
    return stored === "true" || stored === null ? true : false;
  });

  useEffect(() => {
    localStorage.setItem("darkMode", `${darkMode}`);
  }, [darkMode]);

  return (
    <>
      <ToastProvider />
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Auth darkMode={darkMode} />} />

        {/* Protected routes with sidebar */}
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

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
