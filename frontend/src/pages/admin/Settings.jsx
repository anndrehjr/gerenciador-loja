import { useEffect, useState } from "react";
import { Check, ExternalLink, Lock, Sparkles } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { api } from "../../lib/api.js";
import { TEMPLATES } from "../../lib/templates.js";
import { PLAN_INFO, planFeatures } from "../../lib/plans.js";
import { salonTypeInfo } from "../../lib/salonTypes.js";
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

function PlanBadge({ plan }) {
  const info = PLAN_INFO[plan];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent-ink">
      <Sparkles className="h-3.5 w-3.5" />
      Plano {info?.label || plan}
    </span>
  );
}

function CustomizationLocked() {
  return (
    <div className="flex max-w-lg items-start gap-4 rounded-2xl border border-dashed border-line bg-surface/60 p-6">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-hover text-muted">
        <Lock className="h-4.5 w-4.5" />
      </div>
      <div>
        <h2 className="text-sm font-semibold">Personalização completa</h2>
        <p className="mt-1 text-xs text-muted">
          Editar os textos do site, Instagram e galeria direto pelo painel é exclusivo do plano Premium. Fale com a
          equipe da plataforma pra fazer upgrade.
        </p>
      </div>
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

  const [custom, setCustom] = useState(null);
  const [customSaving, setCustomSaving] = useState(false);
  const [customError, setCustomError] = useState("");
  const [customSaved, setCustomSaved] = useState(false);

  useEffect(() => {
    api.get("/salon").then((data) => {
      setSalon(data);
      setForm({
        name: data.name,
        template: data.template,
        logoUrl: data.logoUrl || "",
        primaryColor: data.primaryColor || "",
      });
      const c = data.customization || {};
      setCustom({
        heroHeadline: c.heroHeadline || "",
        heroSubheadline: c.heroSubheadline || "",
        aboutTitle: c.aboutTitle || "",
        aboutText: c.aboutText || "",
        instagramHandle: c.instagramHandle || "",
        gallery: Array.isArray(c.gallery) ? c.gallery.join("\n") : "",
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
        logoUrl: form.logoUrl || null,
        ...(exclusive ? {} : { template: form.template, primaryColor: form.primaryColor || null }),
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

  async function handleCustomSubmit(e) {
    e.preventDefault();
    setCustomError("");
    setCustomSaved(false);
    setCustomSaving(true);
    try {
      const payload = {
        customization: {
          heroHeadline: custom.heroHeadline || undefined,
          heroSubheadline: custom.heroSubheadline || undefined,
          aboutTitle: custom.aboutTitle || undefined,
          aboutText: custom.aboutText || undefined,
          instagramHandle: custom.instagramHandle || undefined,
          gallery: custom.gallery
            ? custom.gallery.split("\n").map((s) => s.trim()).filter(Boolean)
            : undefined,
        },
      };
      const updated = await api.patch("/salon", payload);
      setSalon(updated);
      setCustomSaved(true);
    } catch (err) {
      setCustomError(err.message);
    } finally {
      setCustomSaving(false);
    }
  }

  const publicUrl = salon?.domain
    ? `https://${salon.domain}`
    : salon
      ? `${window.location.origin}/${salon.id}`
      : null;

  const exclusive = salon ? planFeatures(salon.plan).exclusiveTemplate : false;
  const premium = salon ? planFeatures(salon.plan).fullCustomization : false;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold">Configurações</h1>
        {salon && <PlanBadge plan={salon.plan} />}
      </div>

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
              {exclusive
                ? `Seu site usa a landing exclusiva de ${salonTypeInfo(salon.category).label}, definida no cadastro.`
                : "Vale pro site e pra tela de login do seu salão — ninguém mais é afetado."}
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

          {!exclusive && (
            <>
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
            </>
          )}

          {error && <p className="text-sm text-critical">{error}</p>}
          {saved && <p className="text-sm text-accent-ink">Salvo.</p>}

          <Button type="submit" disabled={saving} className="self-start">
            {saving ? "Salvando…" : "Salvar aparência"}
          </Button>
        </form>
      )}

      {exclusive && !premium && <CustomizationLocked />}

      {exclusive && premium && custom && (
        <form
          onSubmit={handleCustomSubmit}
          className="flex max-w-lg flex-col gap-5 rounded-2xl border border-line bg-surface p-6 shadow-soft"
        >
          <div>
            <h2 className="text-sm font-semibold text-muted">Personalização avançada</h2>
            <p className="mt-1 text-xs text-muted">Sobrescreve os textos padrão da sua landing exclusiva.</p>
          </div>

          <Input
            id="heroHeadline"
            label="Frase principal (hero)"
            value={custom.heroHeadline}
            onChange={(e) => setCustom({ ...custom, heroHeadline: e.target.value })}
          />
          <div>
            <label htmlFor="heroSubheadline" className="mb-1.5 block text-sm font-medium text-ink">
              Subtítulo (hero)
            </label>
            <textarea
              id="heroSubheadline"
              rows={2}
              value={custom.heroSubheadline}
              onChange={(e) => setCustom({ ...custom, heroSubheadline: e.target.value })}
              className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none transition duration-200 focus:border-accent focus:ring-2 focus:ring-accent/25"
            />
          </div>
          <Input
            id="aboutTitle"
            label="Título da seção Sobre"
            value={custom.aboutTitle}
            onChange={(e) => setCustom({ ...custom, aboutTitle: e.target.value })}
          />
          <div>
            <label htmlFor="aboutText" className="mb-1.5 block text-sm font-medium text-ink">
              Texto da seção Sobre
            </label>
            <textarea
              id="aboutText"
              rows={3}
              value={custom.aboutText}
              onChange={(e) => setCustom({ ...custom, aboutText: e.target.value })}
              className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none transition duration-200 focus:border-accent focus:ring-2 focus:ring-accent/25"
            />
          </div>
          <Input
            id="instagramHandle"
            label="Instagram (opcional)"
            placeholder="@seusalao"
            value={custom.instagramHandle}
            onChange={(e) => setCustom({ ...custom, instagramHandle: e.target.value })}
          />
          <div>
            <label htmlFor="gallery" className="mb-1.5 block text-sm font-medium text-ink">
              Galeria — uma URL de imagem por linha
            </label>
            <textarea
              id="gallery"
              rows={3}
              value={custom.gallery}
              onChange={(e) => setCustom({ ...custom, gallery: e.target.value })}
              placeholder={"https://…\nhttps://…"}
              className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none transition duration-200 focus:border-accent focus:ring-2 focus:ring-accent/25"
            />
          </div>

          {customError && <p className="text-sm text-critical">{customError}</p>}
          {customSaved && <p className="text-sm text-accent-ink">Salvo.</p>}

          <Button type="submit" disabled={customSaving} className="self-start">
            {customSaving ? "Salvando…" : "Salvar personalização"}
          </Button>
        </form>
      )}

      <p className="text-xs text-muted">Gerenciador de Salão — v1.0.0</p>
    </div>
  );
}
