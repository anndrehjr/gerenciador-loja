import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { LayoutGrid, Store, CreditCard, LogOut } from "lucide-react";
import { useAutenticacao } from "../../contextos/ContextoAutenticacao.jsx";
import AlternadorTema from "../../componentes/AlternadorTema.jsx";

const ITENS_NAVEGACAO = [
  { to: "/master", rotulo: "Salões", icone: Store, ativoSe: (p) => p === "/master" || p.startsWith("/master/salons") },
  { to: "/master/plans", rotulo: "Planos", icone: CreditCard, ativoSe: (p) => p.startsWith("/master/plans") },
];

function ItemNavegacao({ to, rotulo, icone: Icone, ativo }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition duration-200 ${
        ativo ? "bg-gradient-to-r from-accent/15 to-accent-ink/10 text-accent-ink" : "text-muted hover:bg-hover hover:text-ink"
      }`}
    >
      <Icone className="h-4 w-4" />
      {rotulo}
    </Link>
  );
}

export default function LayoutMestre() {
  const { usuario, logout } = useAutenticacao();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-bg text-ink">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-line bg-surface sm:flex">
        <div className="flex h-16 items-center gap-2 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-ink">
            <LayoutGrid className="h-4 w-4 text-white" />
          </div>
          <span className="truncate text-sm font-semibold">Painel Master</span>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
          {ITENS_NAVEGACAO.map((item) => (
            <ItemNavegacao key={item.to} {...item} ativo={item.ativoSe(location.pathname)} />
          ))}
        </nav>

        <div className="flex items-center justify-between gap-2 border-t border-line px-4 py-4">
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{usuario?.nome}</div>
            <div className="truncate text-xs text-muted">{usuario?.email}</div>
          </div>
          <div className="flex items-center gap-1">
            <AlternadorTema />
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

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-surface px-4 py-3 sm:hidden">
        <Link to="/master" className="flex items-center gap-2 font-semibold">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-ink">
            <LayoutGrid className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm">Painel Master</span>
        </Link>
        <div className="flex items-center gap-1">
          <AlternadorTema />
          <button
            onClick={handleLogout}
            aria-label="Sair"
            className="rounded-lg p-2 text-muted transition duration-200 hover:bg-hover hover:text-critical"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-surface/95 backdrop-blur-md sm:hidden">
        {ITENS_NAVEGACAO.map(({ to, rotulo, icone: Icone, ativoSe }) => (
          <Link
            key={to}
            to={to}
            className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition duration-200 ${
              ativoSe(location.pathname) ? "text-accent-ink" : "text-muted"
            }`}
          >
            <Icone className="h-5 w-5" />
            {rotulo}
          </Link>
        ))}
      </nav>

      <main className="min-h-screen px-4 py-6 pb-24 sm:ml-64 sm:px-8 sm:py-8 sm:pb-8">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
