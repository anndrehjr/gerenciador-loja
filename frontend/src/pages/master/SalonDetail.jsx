import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, PauseCircle, PlayCircle, Trash2 } from "lucide-react";
import { api } from "../../lib/api.js";
import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";
import StatTile from "../../components/ui/StatTile.jsx";
import BusinessFieldsSection, { CONTRACT_STATUS_LABELS } from "./BusinessFieldsSection.jsx";
import { PLANS, PLAN_INFO } from "../../lib/plans.js";

const BUSINESS_FIELD_KEYS = [
  "document",
  "legalName",
  "tradeName",
  "ownerName",
  "ownerPhone",
  "ownerWhatsapp",
  "ownerEmail",
  "address",
  "city",
  "state",
  "zipCode",
  "category",
  "notes",
];

export default function SalonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [salon, setSalon] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    api
      .get(`/master/salons/${id}`)
      .then((data) => {
        setSalon(data);
        const business = {};
        for (const key of BUSINESS_FIELD_KEYS) business[key] = data[key] || "";
        setForm({
          name: data.name,
          slug: data.slug,
          domain: data.domain || "",
          plan: data.plan,
          contractStatus: data.contractStatus,
          contractDueDate: data.contractDueDate ? data.contractDueDate.slice(0, 10) : "",
          ...business,
        });
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = { ...form, domain: form.domain || null };
      for (const key of BUSINESS_FIELD_KEYS) payload[key] = form[key] || null;
      payload.contractDueDate = form.contractDueDate ? new Date(form.contractDueDate).toISOString() : null;
      await api.patch(`/master/salons/${id}`, payload);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus() {
    const nextStatus = salon.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    await api.patch(`/master/salons/${id}/status`, { status: nextStatus });
    load();
  }

  async function handleDelete() {
    if (!window.confirm(`Excluir o salão "${salon.name}" e todos os dados dele? Essa ação não pode ser desfeita.`))
      return;
    await api.delete(`/master/salons/${id}`);
    navigate("/master", { replace: true });
  }

  if (loading || !salon || !form) {
    return <p className="text-sm text-muted">Carregando…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <Link to="/master" className="flex w-fit items-center gap-2 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{salon.name}</h1>
          <p className="mt-1 text-sm text-muted">
            {salon.status === "ACTIVE" ? "Ativo" : "Suspenso"} · plano {PLAN_INFO[salon.plan]?.label || salon.plan} ·
            contrato {CONTRACT_STATUS_LABELS[salon.contractStatus]} · criado em{" "}
            {new Date(salon.createdAt).toLocaleDateString("pt-BR")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={toggleStatus}>
            {salon.status === "ACTIVE" ? (
              <>
                <PauseCircle className="h-4 w-4" />
                Suspender
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4" />
                Ativar
              </>
            )}
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
            Excluir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Clientes" value={salon._count.clients} />
        <StatTile label="Serviços" value={salon._count.services} />
        <StatTile label="Profissionais" value={salon._count.professionals} />
        <StatTile label="Agendamentos" value={salon._count.appointments} />
      </div>

      <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-4 rounded-2xl border border-line bg-surface p-6">
        <Input
          id="name"
          label="Nome do salão"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Input
          id="slug"
          label="Slug"
          required
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
        />
        <Input
          id="domain"
          label="Domínio"
          value={form.domain}
          onChange={(e) => setForm({ ...form, domain: e.target.value })}
        />
        <div>
          <label htmlFor="plan" className="mb-1.5 block text-sm font-medium text-ink">
            Plano
          </label>
          <select
            id="plan"
            value={form.plan}
            onChange={(e) => setForm({ ...form, plan: e.target.value })}
            className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm outline-none transition duration-200 focus:border-accent"
          >
            {PLANS.map((p) => (
              <option key={p} value={p}>
                {PLAN_INFO[p].label}
              </option>
            ))}
          </select>
        </div>

        <BusinessFieldsSection form={form} onChange={setForm} />

        {error && <p className="text-sm text-critical">{error}</p>}

        <Button type="submit" disabled={saving} className="mt-2">
          {saving ? "Salvando…" : "Salvar"}
        </Button>
      </form>

      <div className="max-w-lg rounded-2xl border border-line bg-surface p-6">
        <h2 className="text-sm font-semibold text-muted">Usuários</h2>
        <ul className="mt-3 divide-y divide-line">
          {salon.users.map((u) => (
            <li key={u.id} className="py-2 text-sm">
              <div className="font-medium">{u.name}</div>
              <div className="text-muted">{u.email}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
