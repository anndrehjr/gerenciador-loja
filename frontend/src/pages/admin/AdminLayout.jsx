import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Scissors,
  CalendarClock,
  Settings as SettingsIcon,
  LogOut,
  UserRound,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import ThemeToggle from "../../components/ThemeToggle.jsx";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { to: "/clients", label: "Clientes", icon: Users },
  { to: "/services", label: "Serviços", icon: Scissors },
  { to: "/professionals", label: "Profissionais", icon: UserRound },
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
      <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-line bg-surface">
        <div className="flex h-16 items-center gap-2 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-accent-blue">
            <Scissors className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold">Salão</span>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-violet-500/15 to-accent-blue/10 text-accent-ink"
                    : "text-muted hover:bg-hover hover:text-ink"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center justify-between gap-2 border-t border-line px-4 py-4">
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{user?.name}</div>
            <div className="truncate text-xs text-muted">{user?.email}</div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              aria-label="Sair"
              className="rounded-lg p-2 text-muted transition duration-200 hover:bg-hover hover:text-critical"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="ml-64 min-h-screen px-8 py-8">
        <div className="mx-auto max-w-5xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
