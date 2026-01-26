import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./routes/protectedRoute";
import PublicRoute from "./routes/publicRoute";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import NewJournal from "./pages/newJournal";
import NotFound from "./pages/notFound";

function App() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/journals" element={<NewJournal />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
