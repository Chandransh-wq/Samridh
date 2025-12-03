// SidebarLayout.tsx
import { Outlet } from "react-router-dom";
import Sidebar from "../pages/sidebar";

interface SidebarLayoutProps {
  darkMode: boolean;
  setDarkMode: () => void;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({
  darkMode,
  setDarkMode,
}) => {
  return (
    <div className="flex">
      <Sidebar darkMode={darkMode} setDarkMode={setDarkMode} />
      <div className="flex-1">
        <Outlet /> {/* Nested page content goes here */}
      </div>
    </div>
  );
};

export default SidebarLayout;
