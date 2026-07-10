import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Scissors, CalendarClock, Settings as SettingsIcon, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import ThemeToggle from "../../components/ThemeToggle.jsx";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { to: "/clients", label: "Clientes", icon: Users },
  { to: "/services", label: "Serviços", icon: Scissors },
  { to: "/appointments", label: "Agendamentos", icon: CalendarClock },
  { to: "/settings", label: "Configurações", icon: SettingsIcon },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-bg text-ink">
      <nav className="border-b border-line">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium ${
                    isActive ? "bg-accent/10 text-accent-ink" : "text-muted hover:text-ink"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="hidden text-sm text-muted sm:inline">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-muted hover:text-ink"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
