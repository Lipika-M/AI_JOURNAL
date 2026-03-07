import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoadingScreen from "../components/loadingScreen";

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return <LoadingScreen />;
  }

   if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

   return <Outlet />;
};

export default ProtectedRoute;
