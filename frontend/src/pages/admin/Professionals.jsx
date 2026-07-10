import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Save } from "lucide-react";
import { api } from "../../lib/api.js";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";

const EMPTY_FORM = { name: "", specialty: "", bio: "", photoUrl: "", active: true };

const WEEKDAYS = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terça" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sábado" },
];

function minutesToTime(minutes) {
  const h = String(Math.floor(minutes / 60)).padStart(2, "0");
  const m = String(minutes % 60).padStart(2, "0");
  return `${h}:${m}`;
}

function timeToMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function buildHoursState(workingHours) {
  const byWeekday = new Map((workingHours || []).map((h) => [h.weekday, h]));
  return WEEKDAYS.map(({ value }) => {
    const existing = byWeekday.get(value);
    return {
      weekday: value,
      enabled: Boolean(existing),
      start: existing ? minutesToTime(existing.startMinute) : "09:00",
      end: existing ? minutesToTime(existing.endMinute) : "18:00",
    };
  });
}

export default function Professionals() {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [hours, setHours] = useState(buildHoursState([]));
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [savingHours, setSavingHours] = useState(false);

  function load() {
    setLoading(true);
    api
      .get("/professionals")
      .then(setProfessionals)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function startCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setHours(buildHoursState([]));
    setError("");
    setShowForm(true);
  }

  function startEdit(professional) {
    setEditingId(professional.id);
    setForm({
      name: professional.name,
      specialty: professional.specialty || "",
      bio: professional.bio || "",
      photoUrl: professional.photoUrl || "",
      active: professional.active,
    });
    setHours(buildHoursState(professional.workingHours));
    setError("");
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        name: form.name,
        specialty: form.specialty || null,
        bio: form.bio || null,
        photoUrl: form.photoUrl || null,
        active: form.active,
      };
      if (editingId) {
        await api.patch(`/professionals/${editingId}`, payload);
        load();
      } else {
        const created = await api.post("/professionals", payload);
        setEditingId(created.id);
        setHours(buildHoursState([]));
        load();
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSaveHours() {
    setSavingHours(true);
    setError("");
    try {
      const payload = hours
        .filter((h) => h.enabled)
        .map((h) => ({
          weekday: h.weekday,
          startMinute: timeToMinutes(h.start),
          endMinute: timeToMinutes(h.end),
        }));
      await api.put(`/professionals/${editingId}/working-hours`, payload);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingHours(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Remover este profissional?")) return;
    await api.delete(`/professionals/${id}`);
    load();
  }

  function updateHourRow(weekday, patch) {
    setHours((prev) => prev.map((h) => (h.weekday === weekday ? { ...h, ...patch } : h)));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-lg font-semibold">Profissionais</h1>
        <Button onClick={startCreate}>
          <Plus className="h-4 w-4" />
          Novo profissional
        </Button>
      </div>

      {showForm && (
        <div className="flex flex-col gap-6 rounded-2xl border border-line bg-surface p-6 shadow-soft">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end sm:flex-wrap">
            <Input
              id="name"
              label="Nome"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              id="specialty"
              label="Especialidade"
              value={form.specialty}
              onChange={(e) => setForm({ ...form, specialty: e.target.value })}
            />
            <Input
              id="photoUrl"
              label="URL da foto"
              value={form.photoUrl}
              onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              Ativo
            </label>
            <div className="flex gap-2">
              <Button type="submit">{editingId ? "Salvar" : "Adicionar"}</Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                <X className="h-4 w-4" />
                Fechar
              </Button>
            </div>
          </form>

          {editingId && (
            <div className="border-t border-line pt-6">
              <h2 className="text-sm font-semibold text-muted">Horários de atendimento</h2>
              <div className="mt-4 flex flex-col gap-2">
                {hours.map((h) => (
                  <div key={h.weekday} className="flex items-center gap-3 text-sm">
                    <label className="flex w-32 items-center gap-2">
                      <input
                        type="checkbox"
                        checked={h.enabled}
                        onChange={(e) => updateHourRow(h.weekday, { enabled: e.target.checked })}
                      />
                      {WEEKDAYS[h.weekday].label}
                    </label>
                    <input
                      type="time"
                      disabled={!h.enabled}
                      value={h.start}
                      onChange={(e) => updateHourRow(h.weekday, { start: e.target.value })}
                      className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm outline-none transition duration-200 focus:border-accent focus:ring-2 focus:ring-accent/25 disabled:opacity-40"
                    />
                    <span className="text-muted">até</span>
                    <input
                      type="time"
                      disabled={!h.enabled}
                      value={h.end}
                      onChange={(e) => updateHourRow(h.weekday, { end: e.target.value })}
                      className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm outline-none transition duration-200 focus:border-accent focus:ring-2 focus:ring-accent/25 disabled:opacity-40"
                    />
                  </div>
                ))}
              </div>
              <Button className="mt-4" disabled={savingHours} onClick={handleSaveHours}>
                <Save className="h-4 w-4" />
                {savingHours ? "Salvando…" : "Salvar horários"}
              </Button>
            </div>
          )}

          {error && <p className="text-sm text-critical">{error}</p>}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted">Carregando…</p>
      ) : professionals.length === 0 ? (
        <p className="text-sm text-muted">Nenhum profissional cadastrado.</p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {professionals.map((professional) => (
            <li
              key={professional.id}
              className="flex items-center justify-between gap-4 px-5 py-3.5 transition duration-200 hover:bg-hover"
            >
              <div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  {professional.name}
                  {!professional.active && (
                    <span className="rounded-full bg-hover px-2 py-0.5 text-xs text-muted">Inativo</span>
                  )}
                </div>
                {professional.specialty && (
                  <div className="text-sm text-muted">{professional.specialty}</div>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => startEdit(professional)}
                  className="rounded-lg p-2 text-muted transition duration-200 hover:bg-bg hover:text-ink"
                  aria-label="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(professional.id)}
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
