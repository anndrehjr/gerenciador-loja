import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api.js";
import { formatDateTime, STATUS_LABELS } from "../../lib/format.js";
import StatTile from "../../components/ui/StatTile.jsx";

export default function Dashboard() {
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/clients"), api.get("/services"), api.get("/appointments")])
      .then(([c, s, a]) => {
        setClients(c);
        setServices(s);
        setAppointments(a);
      })
      .finally(() => setLoading(false));
  }, []);

  const upcoming = appointments
    .filter((a) => a.status === "AGENDADO" || a.status === "CONFIRMADO")
    .slice(0, 5);

  if (loading) {
    return <p className="text-sm text-muted">Carregando painel…</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatTile label="Clientes" value={clients.length} />
        <StatTile label="Serviços" value={services.length} />
        <StatTile label="Agendamentos" value={appointments.length} />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted">Próximos agendamentos</h2>
          <Link to="/appointments" className="text-sm text-accent-ink hover:underline">
            Ver todos
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Nenhum agendamento pendente.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line rounded-lg border border-line">
            {upcoming.map((a) => (
              <li key={a.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <div className="font-medium">{a.client.name}</div>
                  <div className="text-muted">{a.service.name}</div>
                </div>
                <div className="text-right">
                  <div className="tabular-nums">{formatDateTime(a.date)}</div>
                  <div className="text-muted">{STATUS_LABELS[a.status]}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
