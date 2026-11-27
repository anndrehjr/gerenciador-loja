import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Building2, LayoutGrid, User, Scissors, UserPlus, Check, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useAutenticacao } from "../../contextos/ContextoAutenticacao.jsx";
import { api } from "../../biblioteca/api.js";
import { TIPOS_SALAO } from "../../biblioteca/tiposSalao.js";
import CampoTexto from "../../componentes/ui/CampoTexto.jsx";
import Botao from "../../componentes/ui/Botao.jsx";
import Mensagem from "../../componentes/ui/Mensagem.jsx";

const ETAPAS = [
  { key: "negocio", rotulo: "Negócio", icone: Building2 },
  { key: "tipo", rotulo: "Tipo", icone: LayoutGrid },
  { key: "conta", rotulo: "Sua conta", icone: User },
  { key: "servico", rotulo: "1º serviço", icone: Scissors },
  { key: "equipe", rotulo: "Equipe", icone: UserPlus },
  { key: "pronto", rotulo: "Pronto", icone: Check },
];

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

function Moldura({ titulo, subtitulo, children }) {
  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">{titulo}</h1>
        {subtitulo && <p className="mt-1.5 text-sm text-muted">{subtitulo}</p>}
      </div>
      <div className="mt-8 rounded-3xl border border-line bg-surface p-6 shadow-soft sm:p-8">{children}</div>
    </div>
  );
}

export default function CriarConta() {
  const { cadastrar } = useAutenticacao();
  const navigate = useNavigate();

  const [etapa, setEtapa] = useState(0);
  const [nomeNegocio, setNomeNegocio] = useState("");
  const [categoria, setCategoria] = useState("");
  const [conta, setConta] = useState({ nomeAdmin: "", emailAdmin: "", senhaAdmin: "" });
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const [servico, setServico] = useState({ nome: "", preco: "", duracaoMinutos: "30" });
  const [servicoCriado, setServicoCriado] = useState(false);
  const [profissional, setProfissional] = useState({ nome: "", especialidade: "" });
  const [profissionalCriado, setProfissionalCriado] = useState(false);

  async function handleCriarConta(e) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    try {
      await cadastrar({ nomeNegocio, categoria, ...conta });
      setEtapa(3);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  async function handleCriarServico(e) {
    e.preventDefault();
    setErro("");
    try {
      const precoCentavos = Math.round(parseFloat(servico.preco.replace(",", ".")) * 100);
      if (Number.isNaN(precoCentavos) || precoCentavos < 0) throw new Error("Informe um preço válido.");
      setCarregando(true);
      await api.post("/services", {
        nome: servico.nome,
        precoCentavos,
        duracaoMinutos: parseInt(servico.duracaoMinutos, 10) || 30,
      });
      setServicoCriado(true);
      setEtapa(4);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  async function handleCriarProfissional(e) {
    e.preventDefault();
    setErro("");
    try {
      setCarregando(true);
      await api.post("/professionals", { nome: profissional.nome, especialidade: profissional.especialidade || null });
      setProfissionalCriado(true);
      setEtapa(5);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col gap-8 bg-bg px-6 py-12 text-ink">
      <Link to="/" className="mx-auto flex w-fit items-center gap-2 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      <div className="mx-auto w-full max-w-xl">
        <BarraProgresso etapa={etapa} />
      </div>

      {etapa === 0 && (
        <Moldura titulo="Como se chama o seu negócio?" subtitulo="É o nome que vai aparecer pros seus clientes.">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (nomeNegocio.trim()) setEtapa(1);
            }}
            className="flex flex-col gap-5"
          >
            <CampoTexto
              id="nomeNegocio"
              rotulo="Nome do negócio"
              required
              autoFocus
              value={nomeNegocio}
              onChange={(e) => setNomeNegocio(e.target.value)}
            />
            <Botao type="submit" disabled={!nomeNegocio.trim()} className="self-end">
              Continuar
              <ArrowRight className="h-4 w-4" />
            </Botao>
          </form>
        </Moldura>
      )}

      {etapa === 1 && (
        <Moldura titulo="Qual é o seu tipo de negócio?" subtitulo="Isso define o visual padrão do seu site.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {TIPOS_SALAO.map((t) => {
              const Icone = t.icone;
              const selecionado = categoria === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setCategoria(t.id)}
                  className={`group relative overflow-hidden rounded-2xl border text-left transition duration-300 ${
                    selecionado ? "border-accent shadow-glow" : "border-line hover:-translate-y-0.5 hover:border-accent/40"
                  }`}
                >
                  <div className="h-20 w-full transition duration-300 group-hover:scale-105" style={{ background: t.gradient }} />
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
          <div className="mt-6 flex items-center justify-between">
            <Botao variante="ghost" onClick={() => setEtapa(0)}>
              Voltar
            </Botao>
            <Botao onClick={() => categoria && setEtapa(2)} disabled={!categoria}>
              Continuar
              <ArrowRight className="h-4 w-4" />
            </Botao>
          </div>
        </Moldura>
      )}

      {etapa === 2 && (
        <Moldura titulo="Crie sua conta" subtitulo="Você vai usar esse e-mail e senha pra entrar no painel.">
          <form onSubmit={handleCriarConta} className="flex flex-col gap-4">
            <CampoTexto
              id="nomeAdmin"
              rotulo="Seu nome"
              required
              value={conta.nomeAdmin}
              onChange={(e) => setConta({ ...conta, nomeAdmin: e.target.value })}
            />
            <CampoTexto
              id="emailAdmin"
              rotulo="Email"
              type="email"
              required
              value={conta.emailAdmin}
              onChange={(e) => setConta({ ...conta, emailAdmin: e.target.value })}
            />
            <CampoTexto
              id="senhaAdmin"
              rotulo="Senha"
              type="password"
              minLength={8}
              required
              value={conta.senhaAdmin}
              onChange={(e) => setConta({ ...conta, senhaAdmin: e.target.value })}
            />

            {erro && <p className="text-sm text-critical" role="alert">{erro}</p>}

            <div className="mt-2 flex items-center justify-between">
              <Botao type="button" variante="ghost" onClick={() => setEtapa(1)} disabled={carregando}>
                Voltar
              </Botao>
              <Botao type="submit" disabled={carregando}>
                {carregando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {carregando ? "Criando…" : "Criar conta"}
              </Botao>
            </div>
          </form>
        </Moldura>
      )}

      {etapa === 3 && (
        <Moldura titulo="Cadastre seu primeiro serviço" subtitulo="Dá pra adicionar mais depois, no painel.">
          <form onSubmit={handleCriarServico} className="flex flex-col gap-4">
            <CampoTexto
              id="servicoNome"
              rotulo="Nome do serviço"
              required
              value={servico.nome}
              onChange={(e) => setServico({ ...servico, nome: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <CampoTexto
                id="servicoPreco"
                rotulo="Preço (R$)"
                inputMode="decimal"
                required
                value={servico.preco}
                onChange={(e) => setServico({ ...servico, preco: e.target.value })}
              />
              <CampoTexto
                id="servicoDuracao"
                rotulo="Duração (min)"
                type="number"
                min="1"
                value={servico.duracaoMinutos}
                onChange={(e) => setServico({ ...servico, duracaoMinutos: e.target.value })}
              />
            </div>

            {erro && <p className="text-sm text-critical" role="alert">{erro}</p>}

            <div className="mt-2 flex items-center justify-between">
              <Botao type="button" variante="ghost" onClick={() => setEtapa(4)} disabled={carregando}>
                Pular
              </Botao>
              <Botao type="submit" disabled={carregando || !servico.nome.trim()}>
                {carregando ? "Salvando…" : "Adicionar e continuar"}
                <ArrowRight className="h-4 w-4" />
              </Botao>
            </div>
          </form>
        </Moldura>
      )}

      {etapa === 4 && (
        <Moldura titulo="Cadastre um profissional" subtitulo="Pode ser você mesmo, pra começar.">
          <form onSubmit={handleCriarProfissional} className="flex flex-col gap-4">
            <CampoTexto
              id="profissionalNome"
              rotulo="Nome"
              required
              value={profissional.nome}
              onChange={(e) => setProfissional({ ...profissional, nome: e.target.value })}
            />
            <CampoTexto
              id="profissionalEspecialidade"
              rotulo="Especialidade (opcional)"
              value={profissional.especialidade}
              onChange={(e) => setProfissional({ ...profissional, especialidade: e.target.value })}
            />

            {erro && <p className="text-sm text-critical" role="alert">{erro}</p>}

            <div className="mt-2 flex items-center justify-between">
              <Botao type="button" variante="ghost" onClick={() => setEtapa(5)} disabled={carregando}>
                Pular
              </Botao>
              <Botao type="submit" disabled={carregando || !profissional.nome.trim()}>
                {carregando ? "Salvando…" : "Adicionar e continuar"}
                <ArrowRight className="h-4 w-4" />
              </Botao>
            </div>
          </form>
        </Moldura>
      )}

      {etapa === 5 && (
        <Moldura titulo="Tudo pronto!" subtitulo="Seu salão já está criado e você já está logado.">
          <div className="flex flex-col gap-3">
            <Mensagem tipo="sucesso" texto="Negócio e conta criados." />
            <Mensagem
              tipo={servicoCriado ? "sucesso" : "informacao"}
              texto={servicoCriado ? "Primeiro serviço cadastrado." : "Nenhum serviço cadastrado ainda — adicione no painel."}
            />
            <Mensagem
              tipo={profissionalCriado ? "sucesso" : "informacao"}
              texto={profissionalCriado ? "Primeiro profissional cadastrado." : "Nenhum profissional cadastrado ainda — adicione no painel."}
            />
          </div>
          <Botao onClick={() => navigate("/dashboard")} className="mt-6 w-full">
            Entrar no painel
            <ArrowRight className="h-4 w-4" />
          </Botao>
        </Moldura>
      )}
    </div>
  );
}
