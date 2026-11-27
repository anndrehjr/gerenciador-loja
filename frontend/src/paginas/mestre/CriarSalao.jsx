import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, User, Building2, CreditCard, LayoutGrid, Loader2 } from "lucide-react";
import { api } from "../../biblioteca/api.js";
import CampoTexto from "../../componentes/ui/CampoTexto.jsx";
import Botao from "../../componentes/ui/Botao.jsx";
import { PLANOS, INFO_PLANO } from "../../biblioteca/planos.js";
import { TIPOS_SALAO } from "../../biblioteca/tiposSalao.js";

const ETAPAS = [
  { key: "owner", rotulo: "Proprietário", icone: User },
  { key: "salon", rotulo: "Salão", icone: Building2 },
  { key: "plan", rotulo: "Plano", icone: CreditCard },
  { key: "type", rotulo: "Tipo de negócio", icone: LayoutGrid },
];

const FORM_VAZIO = {
  // Etapa 1 — Proprietário
  nomeAdmin: "",
  documento: "",
  razaoSocial: "",
  nomeFantasia: "",
  emailAdmin: "",
  senhaAdmin: "",
  telefoneProprietario: "",
  whatsappProprietario: "",
  // Etapa 2 — Salão
  nome: "",
  endereco: "",
  cidade: "",
  estado: "",
  cep: "",
  // Etapa 3 — Plano
  plano: "PRO",
  // Etapa 4 — Tipo de negócio
  categoria: "",
};

const MAPA_ACENTOS = { á: "a", à: "a", â: "a", ã: "a", é: "e", ê: "e", í: "i", ó: "o", ô: "o", õ: "o", ú: "u", ç: "c" };

function slugificar(valor) {
  return valor
    .toLowerCase()
    .replace(/[áàâãéêíóôõúç]/g, (ch) => MAPA_ACENTOS[ch] || ch)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function etapaValida(etapa, form) {
  if (etapa === 0) return form.nomeAdmin.trim() && /\S+@\S+\.\S+/.test(form.emailAdmin) && form.senhaAdmin.length >= 8;
  if (etapa === 1) return form.nome.trim().length > 0;
  if (etapa === 2) return PLANOS.includes(form.plano);
  if (etapa === 3) return TIPOS_SALAO.some((t) => t.id === form.categoria);
  return true;
}

function BarraProgresso({ etapa }) {
  return (
    <div className="flex items-center gap-2">
      {ETAPAS.map((s, i) => {
        const Icone = s.icone;
        const estado = i < etapa ? "done" : i === etapa ? "current" : "upcoming";
        return (
          <div key={s.key} className="flex flex-1 items-center gap-2">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition duration-300 ${
                  estado === "done"
                    ? "border-accent bg-accent text-white"
                    : estado === "current"
                      ? "border-accent bg-accent/10 text-accent-ink ring-4 ring-accent/15"
                      : "border-line bg-surface text-muted"
                }`}
              >
                {estado === "done" ? <Check className="h-4 w-4" /> : <Icone className="h-4 w-4" />}
              </div>
              <span
                className={`hidden text-center text-[11px] font-medium sm:block ${
                  estado === "upcoming" ? "text-muted" : "text-ink"
                }`}
              >
                {s.rotulo}
              </span>
            </div>
            {i < ETAPAS.length - 1 && (
              <div className="h-px flex-1 bg-line">
                <div
                  className="h-px bg-accent transition-all duration-500"
                  style={{ width: estado === "upcoming" ? "0%" : "100%" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Campo(props) {
  return <CampoTexto {...props} className={`bg-surface/70 ${props.className || ""}`} />;
}

function EtapaProprietario({ form, definir }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Campo id="nomeAdmin" rotulo="Nome completo" required className="sm:col-span-2" value={form.nomeAdmin} onChange={definir("nomeAdmin")} />
      <Campo id="documento" rotulo="CPF ou CNPJ" value={form.documento} onChange={definir("documento")} />
      <Campo id="razaoSocial" rotulo="Razão Social" value={form.razaoSocial} onChange={definir("razaoSocial")} />
      <Campo id="nomeFantasia" rotulo="Nome Fantasia" value={form.nomeFantasia} onChange={definir("nomeFantasia")} />
      <Campo id="emailAdmin" rotulo="E-mail" type="email" required value={form.emailAdmin} onChange={definir("emailAdmin")} />
      <Campo id="telefoneProprietario" rotulo="Telefone" value={form.telefoneProprietario} onChange={definir("telefoneProprietario")} />
      <Campo id="whatsappProprietario" rotulo="WhatsApp" value={form.whatsappProprietario} onChange={definir("whatsappProprietario")} />
      <Campo
        id="senhaAdmin"
        rotulo="Senha de acesso ao painel"
        type="password"
        required
        minLength={8}
        className="sm:col-span-2"
        value={form.senhaAdmin}
        onChange={definir("senhaAdmin")}
      />
    </div>
  );
}

function EtapaSalao({ form, definir }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Campo id="nome" rotulo="Nome do salão" required className="sm:col-span-2" value={form.nome} onChange={definir("nome")} />
      <Campo id="endereco" rotulo="Endereço" className="sm:col-span-2" value={form.endereco} onChange={definir("endereco")} />
      <Campo id="cidade" rotulo="Cidade" value={form.cidade} onChange={definir("cidade")} />
      <Campo id="estado" rotulo="Estado" maxLength={2} placeholder="SP" value={form.estado} onChange={definir("estado")} />
      <Campo id="cep" rotulo="CEP" value={form.cep} onChange={definir("cep")} />
    </div>
  );
}

function EtapaPlano({ form, setForm }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {PLANOS.map((p) => {
        const info = INFO_PLANO[p];
        const selecionado = form.plano === p;
        return (
          <button
            key={p}
            type="button"
            onClick={() => setForm({ ...form, plano: p })}
            className={`flex flex-col rounded-2xl border p-5 text-left transition duration-200 ${
              selecionado
                ? "border-accent bg-accent/10 shadow-glow"
                : "border-line bg-surface/70 hover:-translate-y-0.5 hover:border-accent/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">{info.rotulo}</span>
              {info.destaque && (
                <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-ink">
                  Popular
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted">{info.slogan}</p>
            <ul className="mt-4 flex-1 space-y-2 text-xs">
              {info.recursos.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-ink" />
                  {f}
                </li>
              ))}
            </ul>
            <div
              className={`mt-4 flex h-8 items-center justify-center rounded-lg text-xs font-medium transition duration-200 ${
                selecionado ? "bg-accent text-white" : "bg-hover text-muted"
              }`}
            >
              {selecionado ? "Selecionado" : "Selecionar"}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function EtapaTipo({ form, setForm }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {TIPOS_SALAO.map((t) => {
        const Icone = t.icone;
        const selecionado = form.categoria === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => setForm({ ...form, categoria: t.id })}
            className={`group relative overflow-hidden rounded-2xl border text-left transition duration-300 ${
              selecionado ? "border-accent shadow-glow" : "border-line hover:-translate-y-0.5 hover:border-accent/40"
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
                  <Icone className="h-4 w-4" />
                </div>
                <span className="font-medium">{t.rotulo}</span>
              </div>
              <p className="mt-2 text-xs text-muted">{t.descricao}</p>
            </div>
            {selecionado && (
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

export default function CriarSalao() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(0);
  const [form, setForm] = useState(FORM_VAZIO);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const definir = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));
  const podeAvancar = useMemo(() => etapaValida(etapa, form), [etapa, form]);
  const ultima = etapa === ETAPAS.length - 1;

  function irParaProxima() {
    if (!podeAvancar) return;
    if (ultima) return handleSubmit();
    setErro("");
    setEtapa((s) => Math.min(s + 1, ETAPAS.length - 1));
  }

  function voltar() {
    setErro("");
    setEtapa((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit() {
    setErro("");
    setCarregando(true);
    try {
      const payload = {
        nome: form.nome,
        slug: slugificar(form.nome),
        plano: form.plano,
        categoria: form.categoria,
        nomeAdmin: form.nomeAdmin,
        emailAdmin: form.emailAdmin,
        senhaAdmin: form.senhaAdmin,
        documento: form.documento || null,
        razaoSocial: form.razaoSocial || null,
        nomeFantasia: form.nomeFantasia || null,
        nomeProprietario: form.nomeAdmin,
        emailProprietario: form.emailAdmin,
        telefoneProprietario: form.telefoneProprietario || null,
        whatsappProprietario: form.whatsappProprietario || null,
        endereco: form.endereco || null,
        cidade: form.cidade || null,
        estado: form.estado || null,
        cep: form.cep || null,
      };
      const salao = await api.post("/master/salons", payload);
      navigate(`/master/salons/${salao.id}`, { replace: true });
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  const ComponenteEtapa = [EtapaProprietario, EtapaSalao, EtapaPlano, EtapaTipo][etapa];

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
            Etapa {etapa + 1} de {ETAPAS.length} — {ETAPAS[etapa].rotulo}
          </p>
        </div>

        <div className="mt-8">
          <BarraProgresso etapa={etapa} />
        </div>

        <div className="relative mt-8 overflow-hidden rounded-3xl border border-line bg-surface/60 p-6 shadow-soft backdrop-blur-sm sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-accent/15 to-accent-ink/10 blur-3xl" />
          <div key={etapa} className="relative animate-[fadeIn_0.35s_ease]">
            <ComponenteEtapa form={form} definir={definir} setForm={setForm} />
          </div>

          {erro && <p className="relative mt-5 text-sm text-critical" role="alert">{erro}</p>}

          <div className="relative mt-8 flex items-center justify-between border-t border-line pt-5">
            <Botao variante="ghost" onClick={voltar} disabled={etapa === 0 || carregando}>
              Voltar
            </Botao>
            <Botao onClick={irParaProxima} disabled={!podeAvancar || carregando}>
              {carregando ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Criando…
                </>
              ) : ultima ? (
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
            </Botao>
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
