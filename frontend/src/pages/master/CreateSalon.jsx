import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, User, Building2, CreditCard, LayoutGrid, Loader2 } from "lucide-react";
import { api } from "../../lib/api.js";
import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";
import { PLANS, PLAN_INFO } from "../../lib/plans.js";
import { SALON_TYPES } from "../../lib/salonTypes.js";

const STEPS = [
  { key: "owner", label: "Proprietário", icon: User },
  { key: "salon", label: "Salão", icon: Building2 },
  { key: "plan", label: "Plano", icon: CreditCard },
  { key: "type", label: "Tipo de negócio", icon: LayoutGrid },
];

const EMPTY_FORM = {
  // Etapa 1 — Proprietário
  adminName: "",
  document: "",
  legalName: "",
  tradeName: "",
  adminEmail: "",
  adminPassword: "",
  ownerPhone: "",
  ownerWhatsapp: "",
  // Etapa 2 — Salão
  name: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  // Etapa 3 — Plano
  plan: "PRO",
  // Etapa 4 — Tipo de negócio
  category: "",
};

const ACCENT_MAP = { á: "a", à: "a", â: "a", ã: "a", é: "e", ê: "e", í: "i", ó: "o", ô: "o", õ: "o", ú: "u", ç: "c" };

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[áàâãéêíóôõúç]/g, (ch) => ACCENT_MAP[ch] || ch)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function stepIsValid(step, form) {
  if (step === 0) return form.adminName.trim() && /\S+@\S+\.\S+/.test(form.adminEmail) && form.adminPassword.length >= 8;
  if (step === 1) return form.name.trim().length > 0;
  if (step === 2) return PLANS.includes(form.plan);
  if (step === 3) return SALON_TYPES.some((t) => t.id === form.category);
  return true;
}

function ProgressBar({ step }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((s, i) => {
        const Icon = s.icon;
        const state = i < step ? "done" : i === step ? "current" : "upcoming";
        return (
          <div key={s.key} className="flex flex-1 items-center gap-2">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition duration-300 ${
                  state === "done"
                    ? "border-accent bg-accent text-white"
                    : state === "current"
                      ? "border-accent bg-accent/10 text-accent-ink ring-4 ring-accent/15"
                      : "border-line bg-surface text-muted"
                }`}
              >
                {state === "done" ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <span
                className={`hidden text-center text-[11px] font-medium sm:block ${
                  state === "upcoming" ? "text-muted" : "text-ink"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="h-px flex-1 bg-line">
                <div
                  className="h-px bg-accent transition-all duration-500"
                  style={{ width: state === "upcoming" ? "0%" : "100%" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Field(props) {
  return <Input {...props} className={`bg-surface/70 ${props.className || ""}`} />;
}

function StepOwner({ form, set }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field id="adminName" label="Nome completo" required className="sm:col-span-2" value={form.adminName} onChange={set("adminName")} />
      <Field id="document" label="CPF ou CNPJ" value={form.document} onChange={set("document")} />
      <Field id="legalName" label="Razão Social" value={form.legalName} onChange={set("legalName")} />
      <Field id="tradeName" label="Nome Fantasia" value={form.tradeName} onChange={set("tradeName")} />
      <Field id="adminEmail" label="E-mail" type="email" required value={form.adminEmail} onChange={set("adminEmail")} />
      <Field id="ownerPhone" label="Telefone" value={form.ownerPhone} onChange={set("ownerPhone")} />
      <Field id="ownerWhatsapp" label="WhatsApp" value={form.ownerWhatsapp} onChange={set("ownerWhatsapp")} />
      <Field
        id="adminPassword"
        label="Senha de acesso ao painel"
        type="password"
        required
        minLength={8}
        className="sm:col-span-2"
        value={form.adminPassword}
        onChange={set("adminPassword")}
      />
    </div>
  );
}

function StepSalon({ form, set }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field id="name" label="Nome do salão" required className="sm:col-span-2" value={form.name} onChange={set("name")} />
      <Field id="address" label="Endereço" className="sm:col-span-2" value={form.address} onChange={set("address")} />
      <Field id="city" label="Cidade" value={form.city} onChange={set("city")} />
      <Field id="state" label="Estado" maxLength={2} placeholder="SP" value={form.state} onChange={set("state")} />
      <Field id="zipCode" label="CEP" value={form.zipCode} onChange={set("zipCode")} />
    </div>
  );
}

function StepPlan({ form, setForm }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {PLANS.map((p) => {
        const info = PLAN_INFO[p];
        const selected = form.plan === p;
        return (
          <button
            key={p}
            type="button"
            onClick={() => setForm({ ...form, plan: p })}
            className={`flex flex-col rounded-2xl border p-5 text-left transition duration-200 ${
              selected
                ? "border-accent bg-accent/10 shadow-glow"
                : "border-line bg-surface/70 hover:-translate-y-0.5 hover:border-accent/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">{info.label}</span>
              {info.highlight && (
                <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-ink">
                  Popular
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted">{info.tagline}</p>
            <ul className="mt-4 flex-1 space-y-2 text-xs">
              {info.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-ink" />
                  {f}
                </li>
              ))}
            </ul>
            <div
              className={`mt-4 flex h-8 items-center justify-center rounded-lg text-xs font-medium transition duration-200 ${
                selected ? "bg-accent text-white" : "bg-hover text-muted"
              }`}
            >
              {selected ? "Selecionado" : "Selecionar"}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function StepType({ form, setForm }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {SALON_TYPES.map((t) => {
        const Icon = t.icon;
        const selected = form.category === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => setForm({ ...form, category: t.id })}
            className={`group relative overflow-hidden rounded-2xl border text-left transition duration-300 ${
              selected ? "border-accent shadow-glow" : "border-line hover:-translate-y-0.5 hover:border-accent/40"
            }`}
          >
            <div
              className="h-24 w-full transition duration-300 group-hover:scale-105"
              style={{ background: t.gradient }}
            />
            <div className="bg-surface/90 p-4">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${t.accent}22`, color: t.accent }}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className="font-medium">{t.label}</span>
              </div>
              <p className="mt-2 text-xs text-muted">{t.description}</p>
            </div>
            {selected && (
              <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white shadow-soft">
                <Check className="h-3.5 w-3.5" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function CreateSalon() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const canAdvance = useMemo(() => stepIsValid(step, form), [step, form]);
  const isLast = step === STEPS.length - 1;

  function goNext() {
    if (!canAdvance) return;
    if (isLast) return handleSubmit();
    setError("");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        slug: slugify(form.name),
        plan: form.plan,
        category: form.category,
        adminName: form.adminName,
        adminEmail: form.adminEmail,
        adminPassword: form.adminPassword,
        document: form.document || null,
        legalName: form.legalName || null,
        tradeName: form.tradeName || null,
        ownerName: form.adminName,
        ownerEmail: form.adminEmail,
        ownerPhone: form.ownerPhone || null,
        ownerWhatsapp: form.ownerWhatsapp || null,
        address: form.address || null,
        city: form.city || null,
        state: form.state || null,
        zipCode: form.zipCode || null,
      };
      const salon = await api.post("/master/salons", payload);
      navigate(`/master/salons/${salon.id}`, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const StepComponent = [StepOwner, StepSalon, StepPlan, StepType][step];

  return (
    <div className="flex flex-col gap-8">
      <Link to="/master" className="flex w-fit items-center gap-2 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      <div className="mx-auto w-full max-w-2xl">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Novo salão</h1>
          <p className="mt-1.5 text-sm text-muted">
            Etapa {step + 1} de {STEPS.length} — {STEPS[step].label}
          </p>
        </div>

        <div className="mt-8">
          <ProgressBar step={step} />
        </div>

        <div className="relative mt-8 overflow-hidden rounded-3xl border border-line bg-surface/60 p-6 shadow-soft backdrop-blur-sm sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-accent/15 to-accent-ink/10 blur-3xl" />
          <div key={step} className="relative animate-[fadeIn_0.35s_ease]">
            <StepComponent form={form} set={set} setForm={setForm} />
          </div>

          {error && <p className="relative mt-5 text-sm text-critical">{error}</p>}

          <div className="relative mt-8 flex items-center justify-between border-t border-line pt-5">
            <Button variant="ghost" onClick={goBack} disabled={step === 0 || loading}>
              Voltar
            </Button>
            <Button onClick={goNext} disabled={!canAdvance || loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Criando…
                </>
              ) : isLast ? (
                <>
                  Criar salão
                  <Check className="h-4 w-4" />
                </>
              ) : (
                <>
                  Continuar
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
