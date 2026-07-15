import { Outlet, useNavigate, Link } from "react-router-dom";
import { LayoutGrid, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import ThemeToggle from "../../components/ThemeToggle.jsx";

export default function MasterLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/master" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-ink">
              <LayoutGrid className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold">Painel Master</span>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="hidden text-sm text-muted sm:inline">{user?.name}</span>
            <button
              onClick={handleLogout}
              aria-label="Sair"
              className="rounded-lg p-2 text-muted transition duration-200 hover:bg-hover hover:text-critical"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
