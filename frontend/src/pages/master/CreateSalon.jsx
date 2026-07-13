import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api } from "../../lib/api.js";
import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";
import BusinessFieldsSection from "./BusinessFieldsSection.jsx";

const EMPTY_FORM = {
  name: "",
  slug: "",
  domain: "",
  plan: "starter",
  adminName: "",
  adminEmail: "",
  adminPassword: "",
  document: "",
  legalName: "",
  ownerName: "",
  ownerPhone: "",
  ownerWhatsapp: "",
  ownerEmail: "",
  address: "",
  contractStatus: "TRIAL",
  contractDueDate: "",
  notes: "",
};

const ACCENT_MAP = { á: "a", à: "a", â: "a", ã: "a", é: "e", ê: "e", í: "i", ó: "o", ô: "o", õ: "o", ú: "u", ç: "c" };

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[áàâãéêíóôõúç]/g, (ch) => ACCENT_MAP[ch] || ch)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function CreateSalon() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleNameChange(value) {
    setForm((f) => ({ ...f, name: value, slug: f.slug === slugify(f.name) ? slugify(value) : f.slug }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        ...form,
        domain: form.domain || null,
        document: form.document || null,
        legalName: form.legalName || null,
        ownerName: form.ownerName || null,
        ownerPhone: form.ownerPhone || null,
        ownerWhatsapp: form.ownerWhatsapp || null,
        ownerEmail: form.ownerEmail || null,
        address: form.address || null,
        contractDueDate: form.contractDueDate ? new Date(form.contractDueDate).toISOString() : null,
        notes: form.notes || null,
      };
      const salon = await api.post("/master/salons", payload);
      navigate(`/master/salons/${salon.id}`, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Link to="/master" className="flex w-fit items-center gap-2 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      <div>
        <h1 className="text-lg font-semibold">Novo salão</h1>
        <p className="mt-1 text-sm text-muted">Cria o salão e o primeiro usuário administrador dele.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-4 rounded-2xl border border-line bg-surface p-6">
        <Input
          id="name"
          label="Nome do salão"
          required
          value={form.name}
          onChange={(e) => handleNameChange(e.target.value)}
        />
        <Input
          id="slug"
          label="Slug"
          required
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
        />
        <Input
          id="domain"
          label="Domínio (opcional)"
          placeholder="ex.: salao-cliente.com.br"
          value={form.domain}
          onChange={(e) => setForm({ ...form, domain: e.target.value })}
        />
        <Input
          id="plan"
          label="Plano"
          value={form.plan}
          onChange={(e) => setForm({ ...form, plan: e.target.value })}
        />

        <div className="mt-2 border-t border-line pt-4 text-sm font-medium text-muted">Primeiro usuário admin</div>

        <Input
          id="adminName"
          label="Nome"
          required
          value={form.adminName}
          onChange={(e) => setForm({ ...form, adminName: e.target.value })}
        />
        <Input
          id="adminEmail"
          label="Email"
          type="email"
          required
          value={form.adminEmail}
          onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
        />
        <Input
          id="adminPassword"
          label="Senha"
          type="password"
          required
          minLength={8}
          value={form.adminPassword}
          onChange={(e) => setForm({ ...form, adminPassword: e.target.value })}
        />

        <BusinessFieldsSection form={form} onChange={setForm} />

        {error && <p className="text-sm text-critical">{error}</p>}

        <Button type="submit" disabled={loading} className="mt-2">
          {loading ? "Criando…" : "Criar salão"}
        </Button>
      </form>
    </div>
  );
}
