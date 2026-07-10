import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext.jsx";

import SiteHome from "./pages/site/SiteHome.jsx";
import BookingWizard from "./pages/site/BookingWizard.jsx";
import Login from "./pages/admin/Login.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import Clients from "./pages/admin/Clients.jsx";
import Services from "./pages/admin/Services.jsx";
import Professionals from "./pages/admin/Professionals.jsx";
import Appointments from "./pages/admin/Appointments.jsx";
import Settings from "./pages/admin/Settings.jsx";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-muted">Carregando…</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SiteHome />} />
      <Route path="/agendar" element={<BookingWizard />} />
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/services" element={<Services />} />
        <Route path="/professionals" element={<Professionals />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
