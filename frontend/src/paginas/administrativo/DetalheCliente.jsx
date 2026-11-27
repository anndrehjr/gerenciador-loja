import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Trash2, Star, Cake, Wallet, CalendarClock } from "lucide-react";
import { api } from "../../biblioteca/api.js";
import { formatarDinheiro, formatarDataHora } from "../../biblioteca/formatacao.js";
import { mostrarMensagem } from "../../contextos/ContextoNotificacoes.jsx";
import CampoTexto from "../../componentes/ui/CampoTexto.jsx";
import Botao from "../../componentes/ui/Botao.jsx";
import Cartao from "../../componentes/ui/Cartao.jsx";
import CartaoEstatistica from "../../componentes/ui/CartaoEstatistica.jsx";
import Esqueleto from "../../componentes/ui/Esqueleto.jsx";
import Mensagem from "../../componentes/ui/Mensagem.jsx";
import Etiqueta from "../../componentes/ui/Etiqueta.jsx";

export default function DetalheCliente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState(null);
  const [form, setForm] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  function carregar() {
    setCarregando(true);
    api
      .get(`/clients/${id}`)
      .then((dados) => {
        setCliente(dados);
        setForm({
          nome: dados.nome,
          email: dados.email || "",
          telefone: dados.telefone || "",
          dataNascimento: dados.dataNascimento ? dados.dataNascimento.slice(0, 10) : "",
          observacoes: dados.observacoes || "",
          vip: dados.vip,
        });
      })
      .finally(() => setCarregando(false));
  }

  useEffect(carregar, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setSalvando(true);
    try {
      await api.patch(`/clients/${id}`, {
        ...form,
        email: form.email || null,
        telefone: form.telefone || null,
        dataNascimento: form.dataNascimento || null,
        observacoes: form.observacoes || null,
      });
      carregar();
      mostrarMensagem({ tipo: "sucesso", texto: "Cliente atualizado com sucesso." });
    } catch (err) {
      setErro(err.message);
      mostrarMensagem({ tipo: "erro", texto: err.message });
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluir() {
    if (!window.confirm(`Remover ${cliente.nome}? O histórico de agendamentos é mantido, só o cadastro é ocultado.`))
      return;
    try {
      await api.delete(`/clients/${id}`);
      mostrarMensagem({ tipo: "sucesso", texto: "Cliente removido." });
      navigate("/clients", { replace: true });
    } catch (err) {
      mostrarMensagem({ tipo: "erro", texto: err.message });
    }
  }

  if (carregando || !cliente || !form) {
    return (
      <div className="flex flex-col gap-6">
        <Esqueleto.Bloco className="h-5 w-24" />
        <Esqueleto.Cartoes quantidade={3} />
        <Esqueleto linhas={4} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Link to="/clients" className="flex w-fit items-center gap-2 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {cliente.urlFoto ? (
            <img src={cliente.urlFoto} alt="" className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent/25 to-accent-ink/15 text-sm font-semibold text-accent-ink">
              {cliente.nome
                .split(" ")
                .slice(0, 2)
                .map((p) => p[0])
                .join("")}
            </div>
          )}
          <h1 className="text-lg font-semibold">{cliente.nome}</h1>
          {cliente.vip && <Etiqueta variante="accent">VIP</Etiqueta>}
        </div>
        <Botao variante="danger" onClick={handleExcluir}>
          <Trash2 className="h-4 w-4" />
          Remover
        </Botao>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <CartaoEstatistica icone={CalendarClock} rotulo="Agendamentos" valor={cliente.agendamentos.length} />
        <CartaoEstatistica icone={Wallet} rotulo="Total gasto" valor={formatarDinheiro(cliente.totalGastoCentavos)} />
        <CartaoEstatistica
          icone={Cake}
          rotulo="Aniversário"
          valor={form.dataNascimento ? new Date(`${form.dataNascimento}T00:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) : "—"}
        />
      </div>

      <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-4 rounded-2xl border border-line bg-surface p-6 shadow-soft">
        <h2 className="text-sm font-semibold text-muted">Dados do cliente</h2>
        <CampoTexto id="nome" rotulo="Nome" required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
        <div className="grid grid-cols-2 gap-4">
          <CampoTexto id="email" rotulo="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <CampoTexto id="telefone" rotulo="Telefone" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
        </div>
        <CampoTexto
          id="dataNascimento"
          rotulo="Data de nascimento"
          type="date"
          value={form.dataNascimento}
          onChange={(e) => setForm({ ...form, dataNascimento: e.target.value })}
        />
        <div>
          <label htmlFor="observacoes" className="mb-1.5 block text-sm font-medium text-ink">
            Observações
          </label>
          <textarea
            id="observacoes"
            rows={3}
            value={form.observacoes}
            onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
            placeholder="Preferências, alergias, o que for útil lembrar no próximo atendimento…"
            className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none transition duration-200 focus:border-accent focus:ring-2 focus:ring-accent/25"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.vip} onChange={(e) => setForm({ ...form, vip: e.target.checked })} />
          <Star className="h-3.5 w-3.5 text-accent-ink" />
          Cliente VIP
        </label>

        {erro && <p className="text-sm text-critical" role="alert">{erro}</p>}

        <Botao type="submit" disabled={salvando} className="self-start">
          {salvando ? "Salvando…" : "Salvar alterações"}
        </Botao>
      </form>

      <Cartao>
        <h2 className="mb-4 text-sm font-semibold text-muted">Histórico de atendimentos</h2>
        {cliente.agendamentos.length === 0 ? (
          <Mensagem tipo="vazio" texto="Nenhum agendamento ainda." />
        ) : (
          <ul className="divide-y divide-line">
            {cliente.agendamentos.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <div>
                  <div className="font-medium">{a.servico.nome}</div>
                  <div className="text-muted">
                    {formatarDataHora(a.data)}
                    {a.profissional ? ` · ${a.profissional.nome}` : ""}
                  </div>
                </div>
                <div className="text-right">
                  {a.pagamento ? (
                    <span className="tabular-nums font-medium">{formatarDinheiro(a.pagamento.valorCentavos)}</span>
                  ) : (
                    <Etiqueta variante="neutro">{a.status}</Etiqueta>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Cartao>
    </div>
  );
}
