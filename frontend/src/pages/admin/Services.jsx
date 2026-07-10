import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { api } from "../../lib/api.js";
import { formatMoney } from "../../lib/format.js";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";

const EMPTY_FORM = { name: "", description: "", price: "", durationMinutes: "30", active: true };

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    api
      .get("/services")
      .then(setServices)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function startCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowForm(true);
  }

  function startEdit(service) {
    setEditingId(service.id);
    setForm({
      name: service.name,
      description: service.description || "",
      price: (service.priceCents / 100).toString(),
      durationMinutes: String(service.durationMinutes),
      active: service.active,
    });
    setError("");
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const priceCents = Math.round(parseFloat(form.price.replace(",", ".")) * 100);
      if (Number.isNaN(priceCents) || priceCents < 0) {
        throw new Error("Informe um preço válido.");
      }
      const durationMinutes = parseInt(form.durationMinutes, 10);
      if (Number.isNaN(durationMinutes) || durationMinutes <= 0) {
        throw new Error("Informe uma duração válida.");
      }
      const payload = {
        name: form.name,
        description: form.description || null,
        priceCents,
        durationMinutes,
        active: form.active,
      };
      if (editingId) {
        await api.patch(`/services/${editingId}`, payload);
      } else {
        await api.post("/services", payload);
      }
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Remover este serviço?")) return;
    await api.delete(`/services/${id}`);
    load();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-lg font-semibold">Serviços</h1>
        <Button onClick={startCreate}>
          <Plus className="h-4 w-4" />
          Novo serviço
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-6 shadow-soft sm:flex-row sm:items-end sm:flex-wrap"
        >
          <Input
            id="name"
            label="Nome"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            id="description"
            label="Descrição"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Input
            id="price"
            label="Preço (R$)"
            inputMode="decimal"
            required
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <Input
            id="durationMinutes"
            label="Duração (min)"
            type="number"
            min="1"
            required
            value={form.durationMinutes}
            onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            Ativo no site
          </label>
          <div className="flex gap-2">
            <Button type="submit">{editingId ? "Salvar" : "Adicionar"}</Button>
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
      ) : services.length === 0 ? (
        <p className="text-sm text-muted">Nenhum serviço cadastrado.</p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {services.map((service) => (
            <li
              key={service.id}
              className="flex items-center justify-between gap-4 px-5 py-3.5 transition duration-200 hover:bg-hover"
            >
              <div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  {service.name}
                  {!service.active && (
                    <span className="rounded-full bg-hover px-2 py-0.5 text-xs text-muted">
                      Inativo
                    </span>
                  )}
                </div>
                {service.description && (
                  <div className="text-sm text-muted">{service.description}</div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted">{service.durationMinutes} min</span>
                <span className="tabular-nums text-sm font-medium">
                  {formatMoney(service.priceCents)}
                </span>
                <button
                  onClick={() => startEdit(service)}
                  className="rounded-lg p-2 text-muted transition duration-200 hover:bg-bg hover:text-ink"
                  aria-label="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
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
