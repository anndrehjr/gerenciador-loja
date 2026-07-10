import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { api } from "../../lib/api.js";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";

const EMPTY_FORM = { name: "", email: "", phone: "" };

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    api
      .get("/clients")
      .then(setClients)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function startCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowForm(true);
  }

  function startEdit(client) {
    setEditingId(client.id);
    setForm({ name: client.name, email: client.email || "", phone: client.phone || "" });
    setError("");
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const payload = { ...form, email: form.email || null, phone: form.phone || null };
      if (editingId) {
        await api.patch(`/clients/${editingId}`, payload);
      } else {
        await api.post("/clients", payload);
      }
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Remover este cliente?")) return;
    await api.delete(`/clients/${id}`);
    load();
  }

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-lg font-semibold">Clientes</h1>
        <Button onClick={startCreate}>
          <Plus className="h-4 w-4" />
          Novo cliente
        </Button>
      </div>

      <Input
        placeholder="Buscar por nome…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs"
      />

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-lg border border-line bg-surface p-5 sm:flex-row sm:items-end sm:flex-wrap"
        >
          <Input
            id="name"
            label="Nome"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            id="email"
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            id="phone"
            label="Telefone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
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
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted">Nenhum cliente encontrado.</p>
      ) : (
        <ul className="divide-y divide-line rounded-lg border border-line">
          {filtered.map((client) => (
            <li key={client.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div>
                <div className="text-sm font-medium">{client.name}</div>
                <div className="text-sm text-muted">
                  {[client.email, client.phone].filter(Boolean).join(" · ") || "—"}
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => startEdit(client)}
                  className="rounded-md p-2 text-muted hover:bg-bg hover:text-ink"
                  aria-label="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(client.id)}
                  className="rounded-md p-2 text-muted hover:bg-bg hover:text-critical"
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
