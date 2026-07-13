import { useEffect, useState } from "react";
import { Check, ExternalLink } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { api } from "../../lib/api.js";
import { TEMPLATES } from "../../lib/templates.js";
import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";

function TemplatePicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {Object.entries(TEMPLATES).map(([key, tpl]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition duration-200 ${
            value === key ? "border-accent ring-1 ring-accent" : "border-line hover:bg-hover"
          }`}
        >
          <div className="flex w-full items-center justify-between">
            <span
              className="h-6 w-6 rounded-full border border-line"
              style={{ backgroundColor: tpl.swatch }}
            />
            {value === key && <Check className="h-4 w-4 text-accent-ink" />}
          </div>
          <div className="text-xs font-medium">{tpl.label}</div>
          <div className="text-[11px] text-muted">{tpl.description}</div>
        </button>
      ))}
    </div>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const [salon, setSalon] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/salon").then((data) => {
      setSalon(data);
      setForm({
        name: data.name,
        template: data.template,
        logoUrl: data.logoUrl || "",
        primaryColor: data.primaryColor || "",
      });
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        template: form.template,
        logoUrl: form.logoUrl || null,
        primaryColor: form.primaryColor || null,
      };
      const updated = await api.patch("/salon", payload);
      setSalon(updated);
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const publicUrl = salon?.domain
    ? `https://${salon.domain}`
    : salon
      ? `${window.location.origin}/${salon.id}`
      : null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold">Configurações</h1>

      <div className="max-w-md rounded-2xl border border-line bg-surface p-6 shadow-soft">
        <h2 className="text-sm font-semibold text-muted">Conta</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Nome</dt>
            <dd>{user?.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Email</dt>
            <dd>{user?.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Perfil</dt>
            <dd>{user?.role}</dd>
          </div>
        </dl>
      </div>

      {form && (
        <form
          onSubmit={handleSubmit}
          className="flex max-w-lg flex-col gap-5 rounded-2xl border border-line bg-surface p-6 shadow-soft"
        >
          <div>
            <h2 className="text-sm font-semibold text-muted">Aparência do site público</h2>
            <p className="mt-1 text-xs text-muted">
              Vale pro site e pra tela de login do seu salão — ninguém mais é afetado.
            </p>
          </div>

          {publicUrl && (
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm text-accent-ink hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {publicUrl}
            </a>
          )}

          <Input
            id="salonName"
            label="Nome do salão"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <Input
            id="logoUrl"
            label="URL da logo (opcional)"
            placeholder="https://…"
            value={form.logoUrl}
            onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
          />

          <div>
            <span className="text-sm font-medium text-ink">Modelo visual</span>
            <div className="mt-2">
              <TemplatePicker value={form.template} onChange={(template) => setForm({ ...form, template })} />
            </div>
          </div>

          <Input
            id="primaryColor"
            label="Cor personalizada (opcional, substitui o modelo)"
            placeholder="#8B5CF6"
            value={form.primaryColor}
            onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
          />

          {error && <p className="text-sm text-critical">{error}</p>}
          {saved && <p className="text-sm text-accent-ink">Salvo.</p>}

          <Button type="submit" disabled={saving} className="self-start">
            {saving ? "Salvando…" : "Salvar aparência"}
          </Button>
        </form>
      )}

      <p className="text-xs text-muted">Gerenciador de Salão — v1.0.0</p>
    </div>
  );
}
