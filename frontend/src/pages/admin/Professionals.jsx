import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Save, CalendarOff } from "lucide-react";
import { api } from "../../lib/api.js";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";

const EMPTY_FORM = { name: "", specialty: "", bio: "", photoUrl: "", active: true };
const EMPTY_TIME_OFF = { startDate: "", endDate: "", reason: "" };

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

function localMidnightIso(dateStr) {
  return new Date(`${dateStr}T00:00:00`).toISOString();
}

function formatDay(isoString) {
  return new Date(isoString).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function buildHoursState(workingHours) {
  const byWeekday = new Map();
  for (const h of workingHours || []) {
    const list = byWeekday.get(h.weekday) || [];
    list.push({ start: minutesToTime(h.startMinute), end: minutesToTime(h.endMinute) });
    byWeekday.set(h.weekday, list);
  }
  return WEEKDAYS.map(({ value }) => ({
    weekday: value,
    windows: (byWeekday.get(value) || []).sort((a, b) => a.start.localeCompare(b.start)),
  }));
}

export default function Professionals() {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [hours, setHours] = useState(buildHoursState([]));
  const [timeOff, setTimeOff] = useState([]);
  const [timeOffForm, setTimeOffForm] = useState(EMPTY_TIME_OFF);
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
    setTimeOff([]);
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
    setTimeOff(professional.timeOff || []);
    setTimeOffForm(EMPTY_TIME_OFF);
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
        setTimeOff([]);
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
      const payload = hours.flatMap((day) =>
        day.windows.map((w) => ({
          weekday: day.weekday,
          startMinute: timeToMinutes(w.start),
          endMinute: timeToMinutes(w.end),
        }))
      );
      await api.put(`/professionals/${editingId}/working-hours`, payload);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingHours(false);
    }
  }

  async function handleAddTimeOff(e) {
    e.preventDefault();
    setError("");
    if (!timeOffForm.startDate || !timeOffForm.endDate) {
      setError("Informe as datas de início e fim.");
      return;
    }
    try {
      const created = await api.post(`/professionals/${editingId}/time-off`, {
        startDate: localMidnightIso(timeOffForm.startDate),
        endDate: localMidnightIso(timeOffForm.endDate),
        reason: timeOffForm.reason || null,
      });
      setTimeOff((prev) => [...prev, created].sort((a, b) => a.startDate.localeCompare(b.startDate)));
      setTimeOffForm(EMPTY_TIME_OFF);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemoveTimeOff(id) {
    await api.delete(`/professionals/${editingId}/time-off/${id}`);
    setTimeOff((prev) => prev.filter((t) => t.id !== id));
  }

  async function handleDelete(id) {
    if (!window.confirm("Remover este profissional?")) return;
    await api.delete(`/professionals/${id}`);
    load();
  }

  function addWindow(weekday) {
    setHours((prev) =>
      prev.map((day) =>
        day.weekday === weekday ? { ...day, windows: [...day.windows, { start: "09:00", end: "18:00" }] } : day
      )
    );
  }

  function removeWindow(weekday, index) {
    setHours((prev) =>
      prev.map((day) =>
        day.weekday === weekday ? { ...day, windows: day.windows.filter((_, i) => i !== index) } : day
      )
    );
  }

  function updateWindow(weekday, index, patch) {
    setHours((prev) =>
      prev.map((day) =>
        day.weekday === weekday
          ? { ...day, windows: day.windows.map((w, i) => (i === index ? { ...w, ...patch } : w)) }
          : day
      )
    );
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
            <div className="flex flex-col gap-6 border-t border-line pt-6">
              <div>
                <h2 className="text-sm font-semibold text-muted">Horários de atendimento</h2>
                <p className="mt-1 text-xs text-muted">
                  Adicione mais de um turno no mesmo dia para intervalos (ex.: manhã e tarde).
                </p>
                <div className="mt-4 flex flex-col gap-3">
                  {hours.map((day) => (
                    <div key={day.weekday} className="flex flex-col gap-2 sm:flex-row sm:items-start">
                      <span className="w-24 shrink-0 pt-1.5 text-sm font-medium">
                        {WEEKDAYS[day.weekday].label}
                      </span>
                      <div className="flex flex-1 flex-col gap-2">
                        {day.windows.length === 0 && (
                          <span className="pt-1.5 text-sm text-muted">Fechado</span>
                        )}
                        {day.windows.map((w, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <input
                              type="time"
                              value={w.start}
                              onChange={(e) => updateWindow(day.weekday, i, { start: e.target.value })}
                              className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm outline-none transition duration-200 focus:border-accent focus:ring-2 focus:ring-accent/25"
                            />
                            <span className="text-muted">até</span>
                            <input
                              type="time"
                              value={w.end}
                              onChange={(e) => updateWindow(day.weekday, i, { end: e.target.value })}
                              className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm outline-none transition duration-200 focus:border-accent focus:ring-2 focus:ring-accent/25"
                            />
                            <button
                              type="button"
                              onClick={() => removeWindow(day.weekday, i)}
                              className="rounded-lg p-1.5 text-muted transition duration-200 hover:bg-hover hover:text-critical"
                              aria-label="Remover turno"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addWindow(day.weekday)}
                          className="self-start text-xs font-medium text-accent-ink hover:underline"
                        >
                          + adicionar turno
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="mt-4" disabled={savingHours} onClick={handleSaveHours}>
                  <Save className="h-4 w-4" />
                  {savingHours ? "Salvando…" : "Salvar horários"}
                </Button>
              </div>

              <div className="border-t border-line pt-6">
                <h2 className="text-sm font-semibold text-muted">Férias e folgas</h2>
                <p className="mt-1 text-xs text-muted">
                  Datas aqui ficam indisponíveis para agendamento, mesmo dentro do horário normal.
                </p>

                {timeOff.length > 0 && (
                  <ul className="mt-4 flex flex-col gap-2">
                    {timeOff.map((t) => (
                      <li
                        key={t.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-line px-3.5 py-2.5 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <CalendarOff className="h-4 w-4 text-muted" />
                          <span>
                            {formatDay(t.startDate)}
                            {t.startDate !== t.endDate ? ` — ${formatDay(t.endDate)}` : ""}
                          </span>
                          {t.reason && <span className="text-muted">· {t.reason}</span>}
                        </div>
                        <button
                          onClick={() => handleRemoveTimeOff(t.id)}
                          className="rounded-lg p-1.5 text-muted transition duration-200 hover:bg-hover hover:text-critical"
                          aria-label="Remover"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <form onSubmit={handleAddTimeOff} className="mt-4 flex flex-wrap items-end gap-3">
                  <Input
                    id="timeOffStart"
                    label="De"
                    type="date"
                    value={timeOffForm.startDate}
                    onChange={(e) => setTimeOffForm({ ...timeOffForm, startDate: e.target.value })}
                  />
                  <Input
                    id="timeOffEnd"
                    label="Até"
                    type="date"
                    value={timeOffForm.endDate}
                    onChange={(e) => setTimeOffForm({ ...timeOffForm, endDate: e.target.value })}
                  />
                  <Input
                    id="timeOffReason"
                    label="Motivo (opcional)"
                    value={timeOffForm.reason}
                    onChange={(e) => setTimeOffForm({ ...timeOffForm, reason: e.target.value })}
                  />
                  <Button type="submit" variant="ghost">
                    <Plus className="h-4 w-4" />
                    Adicionar
                  </Button>
                </form>
              </div>
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
