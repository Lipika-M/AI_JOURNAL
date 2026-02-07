import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./routes/protectedRoute";
import PublicRoute from "./routes/publicRoute";
import LandingPage from "./pages/landingPage";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import JournalDetail from "./pages/journalDetail";
import NotFound from "./pages/notFound";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/journals/:id" element={<JournalDetail />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
