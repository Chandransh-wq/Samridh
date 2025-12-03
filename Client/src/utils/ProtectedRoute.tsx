import { Navigate, Outlet } from "react-router-dom";

interface ProtectedProps {
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedProps> = ({ children }) => {
  const isAuth = localStorage.getItem("token") == "true";

  if (!isAuth) return <Navigate to="/login" replace />;

  // If children exist, render them; otherwise render nested routes via <Outlet>
  return <>{children ? children : <Outlet />}</>;
};

export default ProtectedRoute;
