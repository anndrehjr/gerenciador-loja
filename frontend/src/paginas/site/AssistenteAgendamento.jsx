import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Clock, UserRound, CalendarPlus } from "lucide-react";
import { api } from "../../biblioteca/api.js";
import { formatarDinheiro } from "../../biblioteca/formatacao.js";
import { useSalao } from "../../contextos/ContextoSalao.jsx";
import Botao from "../../componentes/ui/Botao.jsx";
import CampoTexto from "../../componentes/ui/CampoTexto.jsx";

const ROTULOS_ETAPA = ["Telefone", "Serviço", "Profissional", "Data e hora", "Confirmação"];

function EtapasProgresso({ atual }) {
  return (
    <div className="mb-10 flex items-center">
      {ROTULOS_ETAPA.map((rotulo, i) => (
        <div key={rotulo} className="flex flex-1 items-center last:flex-none">
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium transition duration-200 ${
              i <= atual
                ? "bg-gradient-to-br from-accent to-accent-ink text-white"
                : "bg-hover text-muted"
            }`}
          >
            {i < atual ? <Check className="h-4 w-4" /> : i + 1}
          </div>
          {i < ROTULOS_ETAPA.length - 1 && (
            <div className={`mx-2 h-px flex-1 transition duration-200 ${i < atual ? "bg-accent" : "bg-line"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function BlocoEtapa({ titulo, subtitulo, children }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-medium" style={{ fontFamily: "var(--font-display)" }}>
          {titulo}
        </h2>
        {subtitulo && <p className="mt-1 text-sm text-muted">{subtitulo}</p>}
      </div>
      {children}
    </div>
  );
}

function EtapaTelefone({ aoAvancar }) {
  const { basePublica } = useSalao();
  const [telefone, setTelefone] = useState("");
  const [status, setStatus] = useState("idle");
  const [clienteId, setClienteId] = useState(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const digitos = telefone.replace(/\D/g, "");

  useEffect(() => {
    if (digitos.length < 10) {
      setStatus("idle");
      return;
    }
    setStatus("checking");
    const timeout = setTimeout(() => {
      api
        .get(`${basePublica}/clients/lookup?telefone=${encodeURIComponent(digitos)}`)
        .then((dados) => {
          if (dados.encontrado) {
            setClienteId(dados.clienteId);
            setStatus("found");
          } else {
            setStatus("new");
          }
        })
        .catch(() => setStatus("idle"));
    }, 500);
    return () => clearTimeout(timeout);
  }, [digitos, basePublica]);

  // Telefone já cadastrado: não exibimos nome/e-mail/histórico de quem quer
  // que seja (quem está digitando ainda não provou ser o dono do número) —
  // só avançamos direto pra escolha do serviço.
  useEffect(() => {
    if (status !== "found" || !clienteId) return;
    const timeout = setTimeout(() => {
      aoAvancar({ cliente: { id: clienteId }, telefone: digitos });
    }, 600);
    return () => clearTimeout(timeout);
  }, [status, clienteId]);

  async function handleCriarCliente(e) {
    e.preventDefault();
    setErro("");
    if (!nome.trim()) {
      setErro("Informe seu nome.");
      return;
    }
    setEnviando(true);
    try {
      const cliente = await api.post(`${basePublica}/clients`, {
        nome,
        telefone: digitos,
        email: email || null,
      });
      aoAvancar({ cliente: { id: cliente.id }, telefone: digitos });
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <BlocoEtapa titulo="Agende seu horário" subtitulo="Informe seu telefone para começar.">
      <CampoTexto
        id="telefone"
        rotulo="Telefone"
        type="tel"
        placeholder="(11) 98888-7777"
        value={telefone}
        onChange={(e) => setTelefone(e.target.value)}
        autoFocus
      />

      {status === "checking" && <p className="text-sm text-muted">Verificando…</p>}

      {status === "found" && (
        <div className="flex items-center gap-2 rounded-2xl border border-line bg-surface p-5 text-sm text-muted shadow-soft">
          <Check className="h-4 w-4 text-accent-ink" />
          Telefone reconhecido — continuando…
        </div>
      )}

      {status === "new" && (
        <form
          onSubmit={handleCriarCliente}
          className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5 shadow-soft"
        >
          <p className="text-sm text-muted">Não encontramos esse telefone. Vamos criar seu cadastro:</p>
          <CampoTexto id="nome" rotulo="Nome completo" required value={nome} onChange={(e) => setNome(e.target.value)} />
          <CampoTexto
            id="email"
            rotulo="E-mail (opcional)"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {erro && <p className="text-sm text-critical">{erro}</p>}
          <Botao type="submit" disabled={enviando} className="self-start">
            {enviando ? "Enviando…" : "Cadastrar e Continuar"}
            <ArrowRight className="h-4 w-4" />
          </Botao>
        </form>
      )}
    </BlocoEtapa>
  );
}

function AvisoTentarNovamente({ mensagem, aoTentarNovamente }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-surface p-5 text-sm text-muted">
      <span>{mensagem}</span>
      <Botao variante="ghost" onClick={aoTentarNovamente}>
        Tentar novamente
      </Botao>
    </div>
  );
}

function EtapaServico({ aoAvancar, aoVoltar }) {
  const { basePublica } = useSalao();
  const [servicos, setServicos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState(false);
  const [chaveRecarga, setChaveRecarga] = useState(0);

  useEffect(() => {
    setCarregando(true);
    setErroCarregamento(false);
    api
      .get(`${basePublica}/services`)
      .then(setServicos)
      .catch(() => setErroCarregamento(true))
      .finally(() => setCarregando(false));
  }, [chaveRecarga, basePublica]);

  return (
    <BlocoEtapa titulo="Escolha o serviço" subtitulo="Selecione o que você deseja agendar.">
      {carregando ? (
        <p className="text-sm text-muted">Carregando serviços…</p>
      ) : erroCarregamento ? (
        <AvisoTentarNovamente
          mensagem="Não foi possível carregar os serviços agora."
          aoTentarNovamente={() => setChaveRecarga((k) => k + 1)}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {servicos.map((servico) => (
            <button
              key={servico.id}
              onClick={() => aoAvancar(servico)}
              className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-soft hover:border-accent/40"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{servico.nome}</span>
                <span className="tabular-nums font-medium text-accent-ink">
                  {formatarDinheiro(servico.precoCentavos)}
                </span>
              </div>
              {servico.descricao && <p className="text-sm text-muted">{servico.descricao}</p>}
              <span className="flex items-center gap-1 text-xs text-muted">
                <Clock className="h-3.5 w-3.5" />
                {servico.duracaoMinutos} min
              </span>
            </button>
          ))}
        </div>
      )}
      <Botao variante="ghost" onClick={aoVoltar} className="self-start">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Botao>
    </BlocoEtapa>
  );
}

function EtapaProfissional({ servico, aoAvancar, aoVoltar }) {
  const { basePublica } = useSalao();
  const [todosProfissionais, setTodosProfissionais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState(false);
  const [chaveRecarga, setChaveRecarga] = useState(0);

  useEffect(() => {
    setCarregando(true);
    setErroCarregamento(false);
    api
      .get(`${basePublica}/professionals`)
      .then(setTodosProfissionais)
      .catch(() => setErroCarregamento(true))
      .finally(() => setCarregando(false));
  }, [chaveRecarga, basePublica]);

  // Serviço sem profissional vinculado = qualquer um pode atender (mesmo
  // comportamento de sempre). Com vínculo, só quem está vinculado aparece.
  const idsPermitidos = servico?.profissionais?.length ? new Set(servico.profissionais.map((p) => p.id)) : null;
  const profissionais = idsPermitidos ? todosProfissionais.filter((p) => idsPermitidos.has(p.id)) : todosProfissionais;

  return (
    <BlocoEtapa titulo="Escolha o profissional" subtitulo="Quem vai te atender?">
      {carregando ? (
        <p className="text-sm text-muted">Carregando profissionais…</p>
      ) : erroCarregamento ? (
        <AvisoTentarNovamente
          mensagem="Não foi possível carregar os profissionais agora."
          aoTentarNovamente={() => setChaveRecarga((k) => k + 1)}
        />
      ) : profissionais.length === 0 ? (
        <p className="text-sm text-muted">Nenhum profissional disponível no momento.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {profissionais.map((profissional) => (
            <button
              key={profissional.id}
              onClick={() => aoAvancar(profissional)}
              className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-soft hover:border-accent/40"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-accent-ink/10 text-accent-ink">
                <UserRound className="h-6 w-6" />
              </div>
              <div>
                <div className="font-medium">{profissional.nome}</div>
                {profissional.especialidade && (
                  <div className="text-sm text-muted">{profissional.especialidade}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
      <Botao variante="ghost" onClick={aoVoltar} className="self-start">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Botao>
    </BlocoEtapa>
  );
}

function formatarRotuloDia(dataStr) {
  const data = new Date(`${dataStr}T00:00:00`);
  const diaSemana = data.toLocaleDateString("pt-BR", { weekday: "short" });
  const dia = data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  return { diaSemana: diaSemana.replace(".", ""), dia };
}

function EtapaDataHora({ profissional, servico, aoAvancar, aoVoltar }) {
  const { basePublica } = useSalao();
  const [disponibilidade, setDisponibilidade] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState(false);
  const [chaveRecarga, setChaveRecarga] = useState(0);
  const [dataSelecionada, setDataSelecionada] = useState(null);
  const [horarioSelecionado, setHorarioSelecionado] = useState(null);

  useEffect(() => {
    setCarregando(true);
    setErroCarregamento(false);
    api
      .get(`${basePublica}/professionals/${profissional.id}/availability?servicoId=${servico.id}&dias=21`)
      .then((dados) => {
        setDisponibilidade(dados);
        const primeiroComHorarios = dados.find((d) => d.horarios.length > 0);
        if (primeiroComHorarios) setDataSelecionada(primeiroComHorarios.data);
      })
      .catch(() => setErroCarregamento(true))
      .finally(() => setCarregando(false));
  }, [profissional.id, servico.id, chaveRecarga, basePublica]);

  const diaSelecionado = useMemo(
    () => disponibilidade.find((d) => d.data === dataSelecionada),
    [disponibilidade, dataSelecionada]
  );

  const proximaDataDisponivel = useMemo(
    () => disponibilidade.find((d) => d.horarios.length > 0)?.data,
    [disponibilidade]
  );

  if (carregando) {
    return (
      <BlocoEtapa titulo="Escolha data e horário">
        <p className="text-sm text-muted">Carregando disponibilidade…</p>
      </BlocoEtapa>
    );
  }

  if (erroCarregamento) {
    return (
      <BlocoEtapa titulo="Escolha data e horário">
        <AvisoTentarNovamente
          mensagem="Não foi possível carregar os horários disponíveis agora."
          aoTentarNovamente={() => setChaveRecarga((k) => k + 1)}
        />
        <Botao variante="ghost" onClick={aoVoltar} className="self-start">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Botao>
      </BlocoEtapa>
    );
  }

  return (
    <BlocoEtapa titulo="Escolha data e horário" subtitulo={`Com ${profissional.nome}`}>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {disponibilidade.map((dia) => {
          const { diaSemana, dia: rotuloDia } = formatarRotuloDia(dia.data);
          const desabilitado = dia.horarios.length === 0;
          const ativo = dia.data === dataSelecionada;
          return (
            <button
              key={dia.data}
              disabled={desabilitado}
              onClick={() => {
                setDataSelecionada(dia.data);
                setHorarioSelecionado(null);
              }}
              className={`flex shrink-0 flex-col items-center gap-1 rounded-xl border px-3.5 py-2.5 text-xs font-medium transition duration-200 ${
                desabilitado
                  ? "cursor-not-allowed border-line text-muted/40"
                  : ativo
                    ? "border-transparent bg-gradient-to-br from-accent to-accent-ink text-white"
                    : "border-line text-ink hover:bg-hover"
              }`}
            >
              <span className="uppercase">{diaSemana}</span>
              <span>{rotuloDia}</span>
            </button>
          );
        })}
      </div>

      {diaSelecionado && diaSelecionado.horarios.length === 0 && (
        <div className="rounded-2xl border border-line bg-surface p-5 text-sm text-muted">
          Não há horários livres neste dia.
          {proximaDataDisponivel && (
            <button
              className="ml-1 text-accent-ink hover:underline"
              onClick={() => setDataSelecionada(proximaDataDisponivel)}
            >
              Ver próxima disponibilidade
            </button>
          )}
        </div>
      )}

      {diaSelecionado && diaSelecionado.horarios.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {diaSelecionado.horarios.map((horario) => (
            <button
              key={horario}
              onClick={() => setHorarioSelecionado(horario)}
              className={`rounded-xl border px-4 py-2 text-sm font-medium tabular-nums transition duration-200 ${
                horarioSelecionado === horario
                  ? "border-transparent bg-gradient-to-br from-accent to-accent-ink text-white"
                  : "border-line text-ink hover:bg-hover"
              }`}
            >
              {horario}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Botao variante="ghost" onClick={aoVoltar}>
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Botao>
        <Botao
          disabled={!dataSelecionada || !horarioSelecionado}
          onClick={() => aoAvancar({ data: dataSelecionada, horario: horarioSelecionado })}
        >
          Continuar
          <ArrowRight className="h-4 w-4" />
        </Botao>
      </div>
    </BlocoEtapa>
  );
}

function formatarTelefoneExibicao(digitos) {
  if (!digitos) return "";
  if (digitos.length === 11) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
  if (digitos.length === 10) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  return digitos;
}

function EtapaConfirmacao({ agendamento, aoConfirmar, aoVoltar, enviando, erro }) {
  const { telefone, servico, profissional, data, horario } = agendamento;
  const rotuloData = new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  return (
    <BlocoEtapa titulo="Confirme seu agendamento">
      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-6 shadow-soft">
        <LinhaResumo rotulo="Telefone" valor={formatarTelefoneExibicao(telefone)} />
        <LinhaResumo rotulo="Serviço" valor={servico.nome} />
        <LinhaResumo rotulo="Profissional" valor={profissional.nome} />
        <LinhaResumo rotulo="Data" valor={`${rotuloData} às ${horario}`} />
        <LinhaResumo rotulo="Duração estimada" valor={`${servico.duracaoMinutos} min`} />
        <LinhaResumo rotulo="Valor" valor={formatarDinheiro(servico.precoCentavos)} />
      </div>

      {erro && <p className="text-sm text-critical">{erro}</p>}

      <div className="flex items-center gap-2">
        <Botao variante="ghost" onClick={aoVoltar} disabled={enviando}>
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Botao>
        <Botao onClick={aoConfirmar} disabled={enviando}>
          {enviando ? "Confirmando…" : "Confirmar Agendamento"}
          <Check className="h-4 w-4" />
        </Botao>
      </div>
    </BlocoEtapa>
  );
}

function LinhaResumo({ rotulo, valor }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted">{rotulo}</span>
      <span className="font-medium">{valor}</span>
    </div>
  );
}

function EtapaSucesso({ agendamento }) {
  const { salao, caminho } = useSalao();
  const inicio = new Date(agendamento.data);
  const fim = new Date(inicio.getTime() + agendamento.servico.duracaoMinutos * 60000);
  const paraFormatoGoogle = (d) => d.toISOString().replace(/[-:]|\.\d{3}/g, "");

  const urlAgenda = new URL("https://calendar.google.com/calendar/render");
  urlAgenda.searchParams.set("action", "TEMPLATE");
  urlAgenda.searchParams.set("text", `${agendamento.servico.nome} — ${salao?.nome || "Salão"}`);
  urlAgenda.searchParams.set("dates", `${paraFormatoGoogle(inicio)}/${paraFormatoGoogle(fim)}`);
  urlAgenda.searchParams.set(
    "details",
    `Agendamento com ${agendamento.profissional.nome}. Confirmação enviada por WhatsApp.`
  );

  return (
    <div className="flex flex-col items-center gap-6 py-10 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-ink">
        <Check className="h-8 w-8 text-white" />
      </div>
      <div>
        <h2 className="text-2xl font-medium" style={{ fontFamily: "var(--font-display)" }}>
          Agendamento confirmado!
        </h2>
        <p className="mt-1 text-sm text-muted">
          Você vai receber a confirmação por WhatsApp em instantes.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <a href={urlAgenda.toString()} target="_blank" rel="noreferrer">
          <Botao variante="ghost">
            <CalendarPlus className="h-4 w-4" />
            Adicionar ao Google Agenda
          </Botao>
        </a>
        <Link to={caminho("/")}>
          <Botao variante="ghost">Voltar ao início</Botao>
        </Link>
      </div>
    </div>
  );
}

export default function AssistenteAgendamento() {
  const { basePublica } = useSalao();
  const [etapa, setEtapa] = useState(0);
  const [agendamento, setAgendamento] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [agendamentoConfirmado, setAgendamentoConfirmado] = useState(null);

  async function handleConfirmar() {
    setEnviando(true);
    setErro("");
    try {
      const dataHora = new Date(`${agendamento.data}T${agendamento.horario}:00`);
      const resultado = await api.post(`${basePublica}/appointments`, {
        clienteId: agendamento.cliente.id,
        servicoId: agendamento.servico.id,
        profissionalId: agendamento.profissional.id,
        data: dataHora.toISOString(),
      });
      setAgendamentoConfirmado(resultado);
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg px-6 py-16 text-ink">
      <div className="mx-auto max-w-2xl">
        {!agendamentoConfirmado && <EtapasProgresso atual={etapa} />}

        {agendamentoConfirmado ? (
          <EtapaSucesso agendamento={agendamentoConfirmado} />
        ) : etapa === 0 ? (
          <EtapaTelefone
            aoAvancar={(dados) => {
              setAgendamento((b) => ({ ...b, ...dados }));
              setEtapa(1);
            }}
          />
        ) : etapa === 1 ? (
          <EtapaServico
            aoAvancar={(servico) => {
              setAgendamento((b) => ({ ...b, servico }));
              setEtapa(2);
            }}
            aoVoltar={() => setEtapa(0)}
          />
        ) : etapa === 2 ? (
          <EtapaProfissional
            servico={agendamento.servico}
            aoAvancar={(profissional) => {
              setAgendamento((b) => ({ ...b, profissional }));
              setEtapa(3);
            }}
            aoVoltar={() => setEtapa(1)}
          />
        ) : etapa === 3 ? (
          <EtapaDataHora
            profissional={agendamento.profissional}
            servico={agendamento.servico}
            aoAvancar={(dados) => {
              setAgendamento((b) => ({ ...b, ...dados }));
              setEtapa(4);
            }}
            aoVoltar={() => setEtapa(2)}
          />
        ) : (
          <EtapaConfirmacao
            agendamento={agendamento}
            aoConfirmar={handleConfirmar}
            aoVoltar={() => setEtapa(3)}
            enviando={enviando}
            erro={erro}
          />
        )}
      </div>
    </div>
  );
}
