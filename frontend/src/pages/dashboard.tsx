import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.fullName}!</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;