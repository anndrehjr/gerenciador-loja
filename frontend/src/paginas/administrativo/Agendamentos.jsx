import { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { api } from "../../biblioteca/api.js";
import { formatarDataHora, formatarDinheiro, ROTULOS_STATUS } from "../../biblioteca/formatacao.js";
import Botao from "../../componentes/ui/Botao.jsx";
import CampoSelecao from "../../componentes/ui/CampoSelecao.jsx";
import CampoTexto from "../../componentes/ui/CampoTexto.jsx";
import Esqueleto from "../../componentes/ui/Esqueleto.jsx";
import Mensagem from "../../componentes/ui/Mensagem.jsx";

const FORM_VAZIO = {
  clienteId: "",
  servicoId: "",
  profissionalId: "",
  data: "",
  status: "AGENDADO",
  observacoes: "",
};

export default function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState(FORM_VAZIO);
  const [erro, setErro] = useState("");

  function carregar() {
    setCarregando(true);
    const query = filtroStatus ? `?status=${filtroStatus}` : "";
    Promise.all([
      api.get(`/appointments${query}`),
      api.get("/clients"),
      api.get("/services"),
      api.get("/professionals"),
    ])
      .then(([a, c, s, p]) => {
        setAgendamentos(a);
        setClientes(c);
        setServicos(s);
        setProfissionais(p);
      })
      .finally(() => setCarregando(false));
  }

  useEffect(carregar, [filtroStatus]);

  function iniciarCriacao() {
    setForm(FORM_VAZIO);
    setErro("");
    setMostrarForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    try {
      if (!form.clienteId || !form.servicoId || !form.data) {
        throw new Error("Preencha cliente, serviço e data.");
      }
      await api.post("/appointments", {
        clienteId: form.clienteId,
        servicoId: form.servicoId,
        profissionalId: form.profissionalId || null,
        data: new Date(form.data).toISOString(),
        status: form.status,
        observacoes: form.observacoes || null,
      });
      setMostrarForm(false);
      carregar();
    } catch (err) {
      setErro(err.message);
    }
  }

  async function handleMudarStatus(id, status) {
    await api.patch(`/appointments/${id}`, { status });
    carregar();
  }

  async function handleExcluir(id) {
    if (!window.confirm("Remover este agendamento?")) return;
    await api.delete(`/appointments/${id}`);
    carregar();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-lg font-semibold">Agendamentos</h1>
        <Botao onClick={iniciarCriacao}>
          <Plus className="h-4 w-4" />
          Novo agendamento
        </Botao>
      </div>

      <CampoSelecao
        value={filtroStatus}
        onChange={(e) => setFiltroStatus(e.target.value)}
        className="max-w-xs"
      >
        <option value="">Todos os status</option>
        {Object.entries(ROTULOS_STATUS).map(([valor, rotulo]) => (
          <option key={valor} value={valor}>
            {rotulo}
          </option>
        ))}
      </CampoSelecao>

      {mostrarForm && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-6 shadow-soft sm:flex-row sm:items-end sm:flex-wrap"
        >
          <CampoSelecao
            id="clienteId"
            rotulo="Cliente"
            required
            value={form.clienteId}
            onChange={(e) => setForm({ ...form, clienteId: e.target.value })}
          >
            <option value="">Selecione…</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </CampoSelecao>

          <CampoSelecao
            id="servicoId"
            rotulo="Serviço"
            required
            value={form.servicoId}
            onChange={(e) => setForm({ ...form, servicoId: e.target.value })}
          >
            <option value="">Selecione…</option>
            {servicos.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome} — {formatarDinheiro(s.precoCentavos)}
              </option>
            ))}
          </CampoSelecao>

          <CampoSelecao
            id="profissionalId"
            rotulo="Profissional"
            value={form.profissionalId}
            onChange={(e) => setForm({ ...form, profissionalId: e.target.value })}
          >
            <option value="">Sem preferência</option>
            {profissionais.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </CampoSelecao>

          <CampoTexto
            id="data"
            rotulo="Data e hora"
            type="datetime-local"
            required
            value={form.data}
            onChange={(e) => setForm({ ...form, data: e.target.value })}
          />

          <CampoTexto
            id="observacoes"
            rotulo="Observações"
            value={form.observacoes}
            onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
          />

          <div className="flex gap-2">
            <Botao type="submit">Agendar</Botao>
            <Botao type="button" variante="ghost" onClick={() => setMostrarForm(false)}>
              <X className="h-4 w-4" />
              Cancelar
            </Botao>
          </div>
          {erro && <p className="w-full text-sm text-critical" role="alert">{erro}</p>}
        </form>
      )}

      {carregando ? (
        <Esqueleto linhas={5} />
      ) : agendamentos.length === 0 ? (
        <Mensagem
          tipo="vazio"
          titulo={filtroStatus ? "Nenhum agendamento com esse status" : "Nenhum agendamento ainda"}
          texto={filtroStatus ? "Tente outro filtro de status." : "Crie o primeiro agendamento do seu salão."}
          acao={
            !filtroStatus && (
              <Botao onClick={iniciarCriacao} className="px-3.5 py-2 text-xs">
                <Plus className="h-3.5 w-3.5" />
                Novo agendamento
              </Botao>
            )
          }
        />
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {agendamentos.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between gap-4 px-5 py-3.5 transition duration-200 hover:bg-hover"
            >
              <div>
                <div className="text-sm font-medium">{a.cliente.nome}</div>
                <div className="text-sm text-muted">
                  {a.servico.nome}
                  {a.profissional ? ` · ${a.profissional.nome}` : ""} · {formatarDataHora(a.data)}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={a.status}
                  onChange={(e) => handleMudarStatus(a.id, e.target.value)}
                  className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm outline-none transition duration-200 focus:border-accent focus:ring-2 focus:ring-accent/25"
                >
                  {Object.entries(ROTULOS_STATUS).map(([valor, rotulo]) => (
                    <option key={valor} value={valor}>
                      {rotulo}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleExcluir(a.id)}
                  className="rounded-lg p-2 text-muted transition duration-200 hover:bg-bg hover:text-critical"
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
