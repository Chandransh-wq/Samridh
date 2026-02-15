import { Navigate, Outlet } from "react-router-dom";

interface ProtectedProps {
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedProps> = ({ children }) => {
  // Check if token exists and isn't empty
  const token = localStorage.getItem("token");
  const isAuthenticated = token !== null && token !== "";

  // If NOT authenticated, redirect to login
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children ? children : <Outlet />}</>;
};

export default ProtectedRoute;
