import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div >
        <div >Loading...</div>
      </div>
    );
  }

   if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

   return <Outlet />;
};

export default ProtectedRoute;
