import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Scissors,
  CalendarClock,
  Settings as IconeConfiguracoes,
  LogOut,
  UserRound,
  UserCog,
  Wallet,
  BarChart3,
  Home,
  Package,
} from "lucide-react";
import { useAutenticacao } from "../../contextos/ContextoAutenticacao.jsx";
import { usePermissao } from "../../ganchos/usePermissao.js";
import AlternadorTema from "../../componentes/AlternadorTema.jsx";
import SinoNotificacoes from "../../componentes/SinoNotificacoes.jsx";

// recurso casa com biblioteca/permissoes.js — item só aparece pra quem tem
// acesso àquele recurso (DONO vê tudo; ver a matriz completa lá).
const ITENS_NAVEGACAO = [
  { to: "/dashboard", rotulo: "Painel", icone: LayoutDashboard, recurso: "painel" },
  { to: "/appointments", rotulo: "Agenda", icone: CalendarClock, recurso: "agenda" },
  { to: "/clients", rotulo: "Clientes", icone: Users, recurso: "clientes" },
  { to: "/services", rotulo: "Serviços", icone: Scissors, recurso: "servicos" },
  { to: "/team", rotulo: "Equipe", icone: UserCog, recurso: "equipe" },
  { to: "/professionals", rotulo: "Profissionais", icone: UserRound, recurso: "equipe" },
  { to: "/finance", rotulo: "Financeiro", icone: Wallet, recurso: "financeiro" },
  { to: "/inventory", rotulo: "Estoque", icone: Package, recurso: "estoque" },
  { to: "/reports", rotulo: "Relatórios", icone: BarChart3, recurso: "relatorios" },
  { to: "/settings", rotulo: "Configurações", icone: IconeConfiguracoes, recurso: "configuracoes" },
];

// Menu inferior mobile: só os 4 itens do dia a dia (Fase 12/4 da evolução) —
// o resto do painel continua acessível pelo desktop. "Perfil" leva pra
// Configurações, que já reúne conta + senha (não existe uma tela de perfil
// separada ainda — ver pendência no relatório final).
const ITENS_MOBILE = [
  { to: "/dashboard", rotulo: "Início", icone: Home },
  { to: "/appointments", rotulo: "Agenda", icone: CalendarClock },
  { to: "/clients", rotulo: "Clientes", icone: Users },
  { to: "/settings", rotulo: "Perfil", icone: IconeConfiguracoes },
];

function ItemNavegacao({ to, rotulo, icone: Icone }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition duration-200 ${
          isActive
            ? "bg-gradient-to-r from-accent/15 to-accent-ink/10 text-accent-ink"
            : "text-muted hover:bg-hover hover:text-ink"
        }`
      }
    >
      <Icone className="h-4 w-4" />
      {rotulo}
    </NavLink>
  );
}

export default function LayoutAdministrativo() {
  const { usuario, logout } = useAutenticacao();
  const { pode } = usePermissao();
  const navigate = useNavigate();

  const itensPermitidos = ITENS_NAVEGACAO.filter((item) => pode(item.recurso));

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-bg text-ink">
      {/* Sidebar — só desktop */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-line bg-surface sm:flex">
        <div className="flex h-16 items-center gap-2 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-ink">
            <Scissors className="h-4 w-4 text-white" />
          </div>
          <span className="truncate text-sm font-semibold">{usuario?.nomeSalao || "Salão"}</span>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
          {itensPermitidos.map((item) => (
            <ItemNavegacao key={item.to} {...item} />
          ))}
        </nav>

        <div className="flex items-center justify-between gap-2 border-t border-line px-4 py-4">
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{usuario?.nome}</div>
            <div className="truncate text-xs text-muted">{usuario?.email}</div>
          </div>
          <div className="flex items-center gap-1">
            <SinoNotificacoes />
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

      {/* Header — só mobile */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-surface px-4 py-3 sm:hidden">
        <div className="flex items-center gap-2 font-semibold">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-ink">
            <Scissors className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="truncate text-sm">{usuario?.nomeSalao || "Salão"}</span>
        </div>
        <div className="flex items-center gap-1">
          <SinoNotificacoes />
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

      <main className="min-h-screen px-4 py-6 pb-24 sm:ml-64 sm:px-8 sm:py-8 sm:pb-8">
        <div className="mx-auto max-w-5xl">
          <Outlet />
        </div>
      </main>

      {/* Menu inferior — só mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-surface/95 backdrop-blur-md sm:hidden">
        {ITENS_MOBILE.map(({ to, rotulo, icone: Icone }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition duration-200 ${
                isActive ? "text-accent-ink" : "text-muted"
              }`
            }
          >
            <Icone className="h-5 w-5" />
            {rotulo}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
