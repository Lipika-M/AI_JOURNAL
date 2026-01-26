import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/authContext";

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

   if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

   return <Outlet />;
};

export default ProtectedRoute;
