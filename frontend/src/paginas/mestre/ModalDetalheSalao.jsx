import { useEffect, useState } from "react";
import {
  ExternalLink,
  KeyRound,
  PauseCircle,
  PlayCircle,
  Trash2,
  Users,
  CalendarCheck,
  Scissors,
  UserCog,
  Wallet,
  Clock,
  Building2,
  BadgeCheck,
  User,
  MapPin,
  StickyNote,
  Mail,
  Phone,
  CreditCard,
  TrendingUp,
  X,
} from "lucide-react";
import { api } from "../../biblioteca/api.js";
import { mostrarMensagem } from "../../contextos/ContextoNotificacoes.jsx";
import { formatarDinheiro, formatarDataHora } from "../../biblioteca/formatacao.js";
import Botao from "../../componentes/ui/Botao.jsx";
import CampoTexto from "../../componentes/ui/CampoTexto.jsx";
import Etiqueta from "../../componentes/ui/Etiqueta.jsx";
import Modal from "../../componentes/ui/Modal.jsx";
import Carregamento from "../../componentes/ui/Carregamento.jsx";
import { PLANOS, INFO_PLANO } from "../../biblioteca/planos.js";
import { TIPOS_SALAO } from "../../biblioteca/tiposSalao.js";

const CHAVES_CAMPOS_CADASTRAIS = [
  "documento",
  "razaoSocial",
  "nomeFantasia",
  "nomeProprietario",
  "telefoneProprietario",
  "whatsappProprietario",
  "emailProprietario",
  "endereco",
  "cidade",
  "estado",
  "cep",
  "categoria",
  "observacoes",
];

const OPCOES_STATUS_CONTRATO = [
  { value: "TESTE", label: "Teste" },
  { value: "ATIVO", label: "Ativo" },
  { value: "ATRASADO", label: "Em atraso" },
  { value: "CANCELADO", label: "Cancelado" },
];

const ROTULOS_STATUS_CONTRATO = Object.fromEntries(OPCOES_STATUS_CONTRATO.map((o) => [o.value, o.label]));

const ROTULOS_PAPEL_EQUIPE = { DONO: "Dono", GERENTE: "Gerente", PROFISSIONAL: "Profissional", RECEPCIONISTA: "Recepcionista" };

const ABAS = [
  { key: "dados", rotulo: "Dados", icone: Building2 },
  { key: "usuarios", rotulo: "Usuários", icone: Users },
];

function urlPublicaDoSalao(salao) {
  return salao.dominio ? `https://${salao.dominio}` : `${window.location.origin}/${salao.slug}`;
}

function iniciais(nome) {
  return nome
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/* ---------------- Blocos reutilizáveis ---------------- */

function Secao({ titulo, icone: Icone, className = "", children }) {
  return (
    <section className={`rounded-2xl border border-line bg-surface p-5 shadow-soft sm:p-6 ${className}`}>
      <div className="mb-5 flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-hover text-accent-ink">
          <Icone className="h-4 w-4" />
        </span>
        <h3 className="text-sm font-semibold tracking-tight">{titulo}</h3>
      </div>
      {children}
    </section>
  );
}

function CartaoStat({ icone: Icone, rotulo, valor }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-soft transition duration-200 hover:border-accent/40">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-hover text-accent-ink">
        <Icone className="h-[18px] w-[18px]" />
      </span>
      <p className="mt-3 truncate text-2xl font-semibold tracking-tight tabular-nums">{valor}</p>
      <p className="mt-0.5 text-xs text-muted">{rotulo}</p>
    </div>
  );
}

function Campo({ id, rotulo, icone: Icone, className = "", ...props }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-muted">
        {rotulo}
      </label>
      <div className="relative">
        {Icone && <Icone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />}
        <input
          id={id}
          className={`h-11 w-full rounded-xl border border-line bg-hover/40 px-4 text-sm text-ink outline-none transition duration-200 placeholder:text-muted/60 focus:border-accent focus:ring-2 focus:ring-accent/25 ${Icone ? "pl-10" : ""}`}
          {...props}
        />
      </div>
    </div>
  );
}

function CampoSelect({ id, rotulo, className = "", children, ...props }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-muted">
        {rotulo}
      </label>
      <select
        id={id}
        className="h-11 w-full rounded-xl border border-line bg-hover/40 px-3.5 text-sm text-ink outline-none transition duration-200 focus:border-accent focus:ring-2 focus:ring-accent/25"
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

function CampoSomenteLeitura({ rotulo, valor }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted">{rotulo}</label>
      <div className="flex h-11 items-center rounded-xl border border-line bg-hover/15 px-4 text-sm text-muted">{valor}</div>
    </div>
  );
}

function QuickStat({ rotulo, valor }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-line/70 bg-hover/25 px-4 py-3">
      <span className="text-sm text-muted">{rotulo}</span>
      <span className="text-sm font-semibold tabular-nums">{valor}</span>
    </div>
  );
}

function TabButton({ children, active, onClick, icone: Icone }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative inline-flex items-center gap-2 px-3.5 pb-3 pt-1 text-sm font-medium transition duration-200 ${
        active ? "text-ink" : "text-muted hover:text-ink"
      }`}
    >
      <Icone className="h-4 w-4" />
      {children}
      {active && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent" />}
    </button>
  );
}

function ModalRedefinirSenha({ usuario, salaoId, onFechar }) {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    setSenha("");
    setErro("");
  }, [usuario]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      await api.patch(`/master/salons/${salaoId}/users/${usuario.id}/password`, { senha });
      mostrarMensagem({ tipo: "sucesso", texto: `Senha de ${usuario.nome} redefinida.` });
      onFechar();
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal aberto={Boolean(usuario)} onFechar={onFechar} titulo={`Redefinir senha — ${usuario?.nome || ""}`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-sm text-muted">
          O usuário vai poder entrar com a senha nova imediatamente — combine com ele fora daqui pra trocar de novo
          depois, se preferir.
        </p>
        <CampoTexto
          id="novaSenhaUsuario"
          rotulo="Nova senha"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        {erro && <p className="text-sm text-critical">{erro}</p>}
        <Botao type="submit" disabled={enviando} className="w-full">
          <KeyRound className="h-4 w-4" />
          {enviando ? "Salvando…" : "Redefinir senha"}
        </Botao>
      </form>
    </Modal>
  );
}

export default function ModalDetalheSalao({ salaoId, onFechar, onAtualizado }) {
  const [salao, setSalao] = useState(null);
  const [form, setForm] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [aba, setAba] = useState("dados");
  const [usuarioRedefinindo, setUsuarioRedefinindo] = useState(null);

  function carregar() {
    if (!salaoId) return;
    setCarregando(true);
    api
      .get(`/master/salons/${salaoId}`)
      .then((dados) => {
        setSalao(dados);
        const cadastrais = {};
        for (const chave of CHAVES_CAMPOS_CADASTRAIS) cadastrais[chave] = dados[chave] || "";
        setForm({
          nome: dados.nome,
          slug: dados.slug,
          dominio: dados.dominio || "",
          plano: dados.plano,
          statusContrato: dados.statusContrato,
          vencimentoContrato: dados.vencimentoContrato ? dados.vencimentoContrato.slice(0, 10) : "",
          ...cadastrais,
        });
      })
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    setAba("dados");
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salaoId]);

  function definir(campo) {
    return (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setSalvando(true);
    try {
      const payload = { ...form, dominio: form.dominio || null };
      for (const chave of CHAVES_CAMPOS_CADASTRAIS) payload[chave] = form[chave] || null;
      payload.vencimentoContrato = form.vencimentoContrato ? new Date(form.vencimentoContrato).toISOString() : null;
      await api.patch(`/master/salons/${salaoId}`, payload);
      carregar();
      onAtualizado?.();
      mostrarMensagem({ tipo: "sucesso", texto: "Salão atualizado." });
    } catch (err) {
      setErro(err.message);
      mostrarMensagem({ tipo: "erro", texto: err.message });
    } finally {
      setSalvando(false);
    }
  }

  async function alternarStatus() {
    const proximoStatus = salao.status === "ATIVO" ? "SUSPENSO" : "ATIVO";
    await api.patch(`/master/salons/${salaoId}/status`, { status: proximoStatus });
    carregar();
    onAtualizado?.();
  }

  async function handleExcluir() {
    if (!window.confirm(`Excluir o salão "${salao.nome}" e todos os dados dele? Essa ação não pode ser desfeita.`))
      return;
    await api.delete(`/master/salons/${salaoId}`);
    onAtualizado?.();
    onFechar();
  }

  const pagamentosCount = salao?._count.pagamentos || 0;
  const ticketMedioCentavos = pagamentosCount > 0 ? Math.round(salao.faturamentoTotalCentavos / pagamentosCount) : 0;
  const agendamentosPorProfissional =
    salao?._count.profissionais > 0 ? Math.round(salao._count.agendamentos / salao._count.profissionais) : 0;

  return (
    <Modal
      aberto={Boolean(salaoId)}
      onFechar={onFechar}
      className="h-[92vh] w-full max-w-[1360px]"
      semPadding
      semBotaoFechar
    >
      {carregando || !salao || !form ? (
        <div className="flex flex-1 items-center justify-center">
          <Carregamento texto="Carregando…" />
        </div>
      ) : (
        <div className="flex h-full flex-col">
          {/* ===== Cabeçalho fixo ===== */}
          <header className="shrink-0 border-b border-line bg-surface/60 px-6 py-5 sm:px-8">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-line bg-accent/10 text-accent-ink">
                  <Building2 className="h-7 w-7" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="truncate text-2xl font-semibold tracking-tight">{salao.nome}</h2>
                    <Etiqueta variante={salao.status === "ATIVO" ? "sucesso" : "erro"}>
                      {salao.status === "ATIVO" ? "Ativo" : "Suspenso"}
                    </Etiqueta>
                    <Etiqueta variante="accent">Plano {INFO_PLANO[salao.plano]?.rotulo || salao.plano}</Etiqueta>
                  </div>
                  <p className="mt-1.5 text-sm text-muted">
                    Contrato {ROTULOS_STATUS_CONTRATO[salao.statusContrato]} · criado em{" "}
                    {new Date(salao.criadoEm).toLocaleDateString("pt-BR")}
                  </p>
                  <a
                    href={urlPublicaDoSalao(salao)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-accent-ink hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Ver site do salão
                  </a>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2.5">
                <Botao variante="ghost" onClick={alternarStatus}>
                  {salao.status === "ATIVO" ? (
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
                </Botao>
                <Botao variante="danger" onClick={handleExcluir}>
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </Botao>
                <button
                  onClick={onFechar}
                  aria-label="Fechar"
                  className="ml-1 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line text-muted transition duration-200 hover:bg-hover hover:text-ink"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* Abas estilo GitHub */}
            <nav className="mt-5 flex items-center gap-1" aria-label="Seções">
              {ABAS.map((a) => (
                <TabButton key={a.key} active={aba === a.key} onClick={() => setAba(a.key)} icone={a.icone}>
                  {a.rotulo}
                </TabButton>
              ))}
            </nav>
          </header>

          {aba === "dados" ? (
            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
              {/* ===== Conteúdo rolável ===== */}
              <div className="min-h-0 flex-1 overflow-y-auto bg-bg px-6 py-6 sm:px-8">
                <div className="flex flex-col gap-5">
                  {/* Linha 1 — cards de estatística */}
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
                    <CartaoStat icone={Users} rotulo="Clientes" valor={salao._count.clientes} />
                    <CartaoStat icone={CalendarCheck} rotulo="Agendamentos" valor={salao._count.agendamentos} />
                    <CartaoStat icone={Scissors} rotulo="Serviços" valor={salao._count.servicos} />
                    <CartaoStat icone={UserCog} rotulo="Profissionais" valor={salao._count.profissionais} />
                    <CartaoStat icone={Wallet} rotulo="Faturamento" valor={formatarDinheiro(salao.faturamentoTotalCentavos)} />
                    <CartaoStat
                      icone={Clock}
                      rotulo="Último acesso"
                      valor={salao.ultimoAcessoEm ? new Date(salao.ultimoAcessoEm).toLocaleDateString("pt-BR") : "Nunca"}
                    />
                  </div>

                  {/* Linha 2 — Informações gerais / Plano / Estatísticas rápidas */}
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <Secao titulo="Informações gerais" icone={Building2}>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Campo id="nome" rotulo="Nome do salão" required value={form.nome} onChange={definir("nome")} className="sm:col-span-2" />
                        <Campo id="slug" rotulo="Slug" required value={form.slug} onChange={definir("slug")} />
                        <Campo id="dominio" rotulo="Domínio" value={form.dominio} onChange={definir("dominio")} />
                      </div>
                    </Secao>

                    <Secao titulo="Plano e contrato" icone={CreditCard}>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <CampoSelect id="plano" rotulo="Plano atual" value={form.plano} onChange={definir("plano")}>
                          {PLANOS.map((p) => (
                            <option key={p} value={p}>
                              {INFO_PLANO[p].rotulo}
                            </option>
                          ))}
                        </CampoSelect>
                        <CampoSomenteLeitura
                          rotulo="Valor mensal"
                          valor={salao.planoAtual ? formatarDinheiro(salao.planoAtual.precoCentavos) : "—"}
                        />
                        <CampoSelect
                          id="statusContrato"
                          rotulo="Situação do contrato"
                          value={form.statusContrato}
                          onChange={definir("statusContrato")}
                        >
                          {OPCOES_STATUS_CONTRATO.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </CampoSelect>
                        <Campo
                          id="vencimentoContrato"
                          rotulo="Vencimento"
                          type="date"
                          value={form.vencimentoContrato}
                          onChange={definir("vencimentoContrato")}
                        />
                      </div>
                    </Secao>

                    <Secao titulo="Estatísticas rápidas" icone={TrendingUp}>
                      <div className="flex flex-col gap-3">
                        <QuickStat rotulo="Usuários com acesso" valor={salao.usuarios.length} />
                        <QuickStat rotulo="Ticket médio" valor={formatarDinheiro(ticketMedioCentavos)} />
                        <QuickStat rotulo="Agend. por profissional" valor={agendamentosPorProfissional} />
                      </div>
                    </Secao>
                  </div>

                  {/* Linha 3 — Dados cadastrais / Proprietário / Endereço */}
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <Secao titulo="Dados cadastrais" icone={BadgeCheck}>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Campo id="documento" rotulo="CPF ou CNPJ" value={form.documento} onChange={definir("documento")} />
                        <Campo id="razaoSocial" rotulo="Razão social" value={form.razaoSocial} onChange={definir("razaoSocial")} />
                        <Campo id="nomeFantasia" rotulo="Nome fantasia" value={form.nomeFantasia} onChange={definir("nomeFantasia")} />
                        <CampoSelect id="categoria" rotulo="Tipo de negócio" value={form.categoria} onChange={definir("categoria")}>
                          {TIPOS_SALAO.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.rotulo}
                            </option>
                          ))}
                        </CampoSelect>
                      </div>
                    </Secao>

                    <Secao titulo="Proprietário" icone={User}>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Campo
                          id="nomeProprietario"
                          rotulo="Nome"
                          value={form.nomeProprietario}
                          onChange={definir("nomeProprietario")}
                          className="sm:col-span-2"
                        />
                        <Campo
                          id="emailProprietario"
                          rotulo="E-mail"
                          type="email"
                          icone={Mail}
                          value={form.emailProprietario}
                          onChange={definir("emailProprietario")}
                          className="sm:col-span-2"
                        />
                        <Campo
                          id="telefoneProprietario"
                          rotulo="Telefone"
                          icone={Phone}
                          value={form.telefoneProprietario}
                          onChange={definir("telefoneProprietario")}
                        />
                        <Campo
                          id="whatsappProprietario"
                          rotulo="WhatsApp"
                          icone={Phone}
                          value={form.whatsappProprietario}
                          onChange={definir("whatsappProprietario")}
                        />
                      </div>
                    </Secao>

                    <Secao titulo="Endereço" icone={MapPin}>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Campo id="endereco" rotulo="Endereço" value={form.endereco} onChange={definir("endereco")} className="sm:col-span-2" />
                        <Campo id="cidade" rotulo="Cidade" value={form.cidade} onChange={definir("cidade")} />
                        <Campo id="estado" rotulo="Estado" maxLength={2} value={form.estado} onChange={definir("estado")} />
                        <Campo id="cep" rotulo="CEP" value={form.cep} onChange={definir("cep")} className="sm:col-span-2" />
                      </div>
                    </Secao>
                  </div>

                  {/* Linha 4 — Observações */}
                  <Secao titulo="Observações" icone={StickyNote}>
                    <label htmlFor="observacoes" className="mb-2 block text-xs font-medium text-muted">
                      Notas internas
                    </label>
                    <textarea
                      id="observacoes"
                      rows={4}
                      value={form.observacoes}
                      onChange={definir("observacoes")}
                      className="w-full resize-none rounded-xl border border-line bg-hover/40 px-4 py-3 text-sm text-ink outline-none transition duration-200 placeholder:text-muted/60 focus:border-accent focus:ring-2 focus:ring-accent/25"
                    />
                  </Secao>
                </div>
              </div>

              {/* ===== Rodapé fixo ===== */}
              <footer className="flex shrink-0 items-center justify-between gap-4 border-t border-line bg-surface/60 px-6 py-4 sm:px-8">
                <p className="text-xs text-muted">
                  {erro ? <span className="text-critical">{erro}</span> : `Última alteração salva em ${formatarDataHora(salao.atualizadoEm)}`}
                </p>
                <div className="flex items-center gap-3">
                  <Botao type="button" variante="ghost" onClick={onFechar}>
                    Cancelar
                  </Botao>
                  <Botao type="submit" disabled={salvando}>
                    {salvando ? "Salvando…" : "Salvar alterações"}
                  </Botao>
                </div>
              </footer>
            </form>
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto bg-bg px-6 py-6 sm:px-8">
              <Secao titulo="Usuários do salão" icone={Users}>
                <div className="overflow-hidden rounded-xl border border-line">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-hover/50 text-xs uppercase tracking-wide text-muted">
                      <tr>
                        <th className="px-4 py-3 font-medium">Nome</th>
                        <th className="px-4 py-3 font-medium">E-mail</th>
                        <th className="px-4 py-3 font-medium">Função</th>
                        <th className="px-4 py-3 font-medium" />
                      </tr>
                    </thead>
                    <tbody>
                      {salao.usuarios.map((u, i) => (
                        <tr
                          key={u.id}
                          className={`border-t border-line transition duration-200 hover:bg-hover/40 ${i % 2 === 1 ? "bg-surface/40" : ""}`}
                        >
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-accent/10 text-xs font-semibold text-accent-ink">
                                {iniciais(u.nome)}
                              </div>
                              <span className="font-medium">{u.nome}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-muted">{u.email}</td>
                          <td className="px-4 py-3.5 text-muted">{ROTULOS_PAPEL_EQUIPE[u.papelEquipe] || "—"}</td>
                          <td className="px-4 py-3.5 text-right">
                            <button
                              onClick={() => setUsuarioRedefinindo(u)}
                              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted transition duration-200 hover:bg-hover hover:text-accent-ink"
                            >
                              <KeyRound className="h-3.5 w-3.5" />
                              Redefinir senha
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {salao.usuarios.length === 0 && <p className="p-4 text-sm text-muted">Nenhum usuário cadastrado.</p>}
                </div>
              </Secao>
            </div>
          )}
        </div>
      )}

      <ModalRedefinirSenha usuario={usuarioRedefinindo} salaoId={salaoId} onFechar={() => setUsuarioRedefinindo(null)} />
    </Modal>
  );
}
