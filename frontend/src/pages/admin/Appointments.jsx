import { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { api } from "../../lib/api.js";
import { formatDateTime, formatMoney, STATUS_LABELS } from "../../lib/format.js";
import Button from "../../components/ui/Button.jsx";
import Select from "../../components/ui/Select.jsx";
import Input from "../../components/ui/Input.jsx";

const EMPTY_FORM = { clientId: "", serviceId: "", date: "", status: "AGENDADO", notes: "" };

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    const query = statusFilter ? `?status=${statusFilter}` : "";
    Promise.all([
      api.get(`/appointments${query}`),
      api.get("/clients"),
      api.get("/services"),
    ])
      .then(([a, c, s]) => {
        setAppointments(a);
        setClients(c);
        setServices(s);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, [statusFilter]);

  function startCreate() {
    setForm(EMPTY_FORM);
    setError("");
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      if (!form.clientId || !form.serviceId || !form.date) {
        throw new Error("Preencha cliente, serviço e data.");
      }
      await api.post("/appointments", {
        clientId: form.clientId,
        serviceId: form.serviceId,
        date: new Date(form.date).toISOString(),
        status: form.status,
        notes: form.notes || null,
      });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleStatusChange(id, status) {
    await api.patch(`/appointments/${id}`, { status });
    load();
  }

  async function handleDelete(id) {
    if (!window.confirm("Remover este agendamento?")) return;
    await api.delete(`/appointments/${id}`);
    load();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-lg font-semibold">Agendamentos</h1>
        <Button onClick={startCreate}>
          <Plus className="h-4 w-4" />
          Novo agendamento
        </Button>
      </div>

      <Select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="max-w-xs"
      >
        <option value="">Todos os status</option>
        {Object.entries(STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-6 shadow-soft sm:flex-row sm:items-end sm:flex-wrap"
        >
          <Select
            id="clientId"
            label="Cliente"
            required
            value={form.clientId}
            onChange={(e) => setForm({ ...form, clientId: e.target.value })}
          >
            <option value="">Selecione…</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>

          <Select
            id="serviceId"
            label="Serviço"
            required
            value={form.serviceId}
            onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
          >
            <option value="">Selecione…</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {formatMoney(s.priceCents)}
              </option>
            ))}
          </Select>

          <Input
            id="date"
            label="Data e hora"
            type="datetime-local"
            required
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />

          <Input
            id="notes"
            label="Observações"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />

          <div className="flex gap-2">
            <Button type="submit">Agendar</Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
              <X className="h-4 w-4" />
              Cancelar
            </Button>
          </div>
          {error && <p className="w-full text-sm text-critical">{error}</p>}
        </form>
      )}

      {loading ? (
        <p className="text-sm text-muted">Carregando…</p>
      ) : appointments.length === 0 ? (
        <p className="text-sm text-muted">Nenhum agendamento encontrado.</p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {appointments.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between gap-4 px-5 py-3.5 transition duration-200 hover:bg-hover"
            >
              <div>
                <div className="text-sm font-medium">{a.client.name}</div>
                <div className="text-sm text-muted">
                  {a.service.name} · {formatDateTime(a.date)}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={a.status}
                  onChange={(e) => handleStatusChange(a.id, e.target.value)}
                  className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm outline-none transition duration-200 focus:border-accent focus:ring-2 focus:ring-accent/25"
                >
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="rounded-lg p-2 text-muted transition duration-200 hover:bg-bg hover:text-critical"
                  aria-label="Remover"
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
