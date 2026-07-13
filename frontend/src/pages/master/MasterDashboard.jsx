import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, PauseCircle, PlayCircle, Trash2, Store, Users, CalendarClock } from "lucide-react";
import { api } from "../../lib/api.js";
import StatTile from "../../components/ui/StatTile.jsx";

const STATUS_LABEL = { ACTIVE: "Ativo", SUSPENDED: "Suspenso" };

function StatusChip({ status }) {
  const isActive = status === "ACTIVE";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        isActive ? "bg-accent/10 text-accent-ink" : "bg-critical/10 text-critical"
      }`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export default function MasterDashboard() {
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api
      .get("/master/salons")
      .then(setSalons)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function toggleStatus(salon) {
    const nextStatus = salon.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    await api.patch(`/master/salons/${salon.id}/status`, { status: nextStatus });
    load();
  }

  async function handleDelete(salon) {
    if (!window.confirm(`Excluir o salão "${salon.name}" e todos os dados dele? Essa ação não pode ser desfeita.`))
      return;
    await api.delete(`/master/salons/${salon.id}`);
    load();
  }

  const totals = salons.reduce(
    (acc, s) => ({
      clients: acc.clients + s._count.clients,
      appointments: acc.appointments + s._count.appointments,
      active: acc.active + (s.status === "ACTIVE" ? 1 : 0),
    }),
    { clients: 0, appointments: 0, active: 0 }
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Salões</h1>
          <p className="mt-1 text-sm text-muted">Todos os salões cadastrados na plataforma.</p>
        </div>
        <Link
          to="/master/salons/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-violet-500 to-accent px-4 py-2.5 text-sm font-medium text-white shadow-soft transition duration-200 hover:-translate-y-0.5 hover:shadow-glow"
        >
          <Plus className="h-4 w-4" />
          Novo salão
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatTile icon={Store} label="Salões ativos" value={`${totals.active} / ${salons.length}`} />
        <StatTile icon={Users} label="Clientes (todos os salões)" value={totals.clients} />
        <StatTile icon={CalendarClock} label="Agendamentos (todos)" value={totals.appointments} />
      </div>

      {loading ? (
        <p className="text-sm text-muted">Carregando…</p>
      ) : salons.length === 0 ? (
        <p className="text-sm text-muted">Nenhum salão cadastrado ainda.</p>
      ) : (
        <ul className="divide-y divide-line rounded-2xl border border-line bg-surface">
          {salons.map((salon) => (
            <li key={salon.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{salon.name}</span>
                  <StatusChip status={salon.status} />
                </div>
                <div className="mt-1 text-sm text-muted">
                  {salon.domain || `${window.location.origin}/${salon.id}`} · plano {salon.plan}
                </div>
                <div className="mt-1 text-xs text-muted">
                  {salon._count.clients} clientes · {salon._count.services} serviços ·{" "}
                  {salon._count.professionals} profissionais · {salon._count.appointments} agendamentos
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Link
                  to={`/master/salons/${salon.id}`}
                  className="rounded-lg p-2 text-muted transition duration-200 hover:bg-hover hover:text-ink"
                  aria-label="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => toggleStatus(salon)}
                  className="rounded-lg p-2 text-muted transition duration-200 hover:bg-hover hover:text-ink"
                  aria-label={salon.status === "ACTIVE" ? "Suspender" : "Ativar"}
                  title={salon.status === "ACTIVE" ? "Suspender" : "Ativar"}
                >
                  {salon.status === "ACTIVE" ? (
                    <PauseCircle className="h-4 w-4" />
                  ) : (
                    <PlayCircle className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(salon)}
                  className="rounded-lg p-2 text-muted transition duration-200 hover:bg-hover hover:text-critical"
                  aria-label="Excluir"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
