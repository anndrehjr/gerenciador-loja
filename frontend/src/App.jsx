import { Routes, Route, Navigate, useParams } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext.jsx";
import { SalonProvider } from "./contexts/SalonContext.jsx";

import PlatformHome from "./pages/site/PlatformHome.jsx";
import SiteHome from "./pages/site/SiteHome.jsx";
import BookingWizard from "./pages/site/BookingWizard.jsx";
import SalonLogin from "./pages/site/SalonLogin.jsx";
import Login from "./pages/admin/Login.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import Clients from "./pages/admin/Clients.jsx";
import Services from "./pages/admin/Services.jsx";
import Professionals from "./pages/admin/Professionals.jsx";
import Appointments from "./pages/admin/Appointments.jsx";
import Settings from "./pages/admin/Settings.jsx";
import MasterLayout from "./pages/master/MasterLayout.jsx";
import MasterDashboard from "./pages/master/MasterDashboard.jsx";
import CreateSalon from "./pages/master/CreateSalon.jsx";
import SalonDetail from "./pages/master/SalonDetail.jsx";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-muted">Carregando…</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (user.role === "MASTER") {
    return <Navigate to="/master" replace />;
  }
  return children;
}

function MasterRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-muted">Carregando…</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== "MASTER") {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

// Lê o :salonId da URL (rotas /:salonId/...) e monta o contexto do salão
// pra tudo que estiver dentro — site público, agendamento, login com marca.
function SalonRoute({ children }) {
  const { salonId } = useParams();
  return <SalonProvider salonId={salonId}>{children}</SalonProvider>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PlatformHome />} />
      <Route path="/login" element={<Login />} />

      <Route path="/:salonId" element={<SalonRoute><SiteHome /></SalonRoute>} />
      <Route path="/:salonId/agendar" element={<SalonRoute><BookingWizard /></SalonRoute>} />
      <Route path="/:salonId/login" element={<SalonRoute><SalonLogin /></SalonRoute>} />

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

      <Route
        element={
          <MasterRoute>
            <MasterLayout />
          </MasterRoute>
        }
      >
        <Route path="/master" element={<MasterDashboard />} />
        <Route path="/master/salons/new" element={<CreateSalon />} />
        <Route path="/master/salons/:id" element={<SalonDetail />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
