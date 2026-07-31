import { useEffect, useState } from "react";
import { Wallet, TrendingUp, TrendingDown, Receipt, Award, Plus } from "lucide-react";
import { api } from "../../biblioteca/api.js";
import { formatarDinheiro, formatarDataHora } from "../../biblioteca/formatacao.js";
import { mostrarMensagem } from "../../contextos/ContextoNotificacoes.jsx";
import CartaoEstatistica from "../../componentes/ui/CartaoEstatistica.jsx";
import Esqueleto from "../../componentes/ui/Esqueleto.jsx";
import Mensagem from "../../componentes/ui/Mensagem.jsx";
import Tabela from "../../componentes/ui/Tabela.jsx";
import Modal from "../../componentes/ui/Modal.jsx";
import Botao from "../../componentes/ui/Botao.jsx";
import CampoTexto from "../../componentes/ui/CampoTexto.jsx";
import CampoSelecao from "../../componentes/ui/CampoSelecao.jsx";
import Etiqueta from "../../componentes/ui/Etiqueta.jsx";

const ROTULOS_METODO = { DINHEIRO: "Dinheiro", PIX: "Pix", CARTAO: "Cartão" };
const ROTULOS_CATEGORIA_DESPESA = {
  ALUGUEL: "Aluguel",
  FOLHA_PAGAMENTO: "Folha de pagamento",
  PRODUTOS: "Produtos",
  MARKETING: "Marketing",
  MANUTENCAO: "Manutenção",
  OUTROS: "Outros",
};
const FORM_VAZIO = { agendamentoId: "", valorCentavos: "", metodo: "PIX", percentualComissao: "" };
const FORM_DESPESA_VAZIO = { descricao: "", categoria: "OUTROS", valorCentavos: "", data: new Date().toISOString().slice(0, 10) };

function ModalRegistrarPagamento({ aberto, onFechar, onRegistrado }) {
  const [agendamentosDisponiveis, setAgendamentosDisponiveis] = useState([]);
  const [form, setForm] = useState(FORM_VAZIO);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!aberto) return;
    setForm(FORM_VAZIO);
    setErro("");
    api.get("/appointments?status=CONCLUIDO").then(setAgendamentosDisponiveis);
  }, [aberto]);

  function selecionarAgendamento(id) {
    const agendamento = agendamentosDisponiveis.find((a) => a.id === id);
    setForm((f) => ({
      ...f,
      agendamentoId: id,
      valorCentavos: agendamento ? String(agendamento.servico.precoCentavos / 100) : f.valorCentavos,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    try {
      const valorCentavos = Math.round(parseFloat(String(form.valorCentavos).replace(",", ".")) * 100);
      if (!form.agendamentoId) throw new Error("Selecione o agendamento.");
      if (Number.isNaN(valorCentavos) || valorCentavos <= 0) throw new Error("Informe um valor válido.");

      setEnviando(true);
      await api.post("/finance/payments", {
        agendamentoId: form.agendamentoId,
        valorCentavos,
        metodo: form.metodo,
        percentualComissao: form.percentualComissao ? Number(form.percentualComissao) : undefined,
      });
      mostrarMensagem({ tipo: "sucesso", texto: "Pagamento registrado com sucesso." });
      onRegistrado();
      onFechar();
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal aberto={aberto} onFechar={onFechar} titulo="Registrar pagamento">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <CampoSelecao
          id="agendamentoId"
          rotulo="Agendamento finalizado"
          required
          value={form.agendamentoId}
          onChange={(e) => selecionarAgendamento(e.target.value)}
        >
          <option value="">Selecione…</option>
          {agendamentosDisponiveis.map((a) => (
            <option key={a.id} value={a.id}>
              {a.cliente.nome} — {a.servico.nome} ({formatarDataHora(a.data)})
            </option>
          ))}
        </CampoSelecao>

        <CampoTexto
          id="valorCentavos"
          rotulo="Valor recebido (R$)"
          inputMode="decimal"
          required
          value={form.valorCentavos}
          onChange={(e) => setForm({ ...form, valorCentavos: e.target.value })}
        />

        <CampoSelecao
          id="metodo"
          rotulo="Método"
          value={form.metodo}
          onChange={(e) => setForm({ ...form, metodo: e.target.value })}
        >
          {Object.entries(ROTULOS_METODO).map(([valor, rotulo]) => (
            <option key={valor} value={valor}>
              {rotulo}
            </option>
          ))}
        </CampoSelecao>

        <CampoTexto
          id="percentualComissao"
          rotulo="Comissão do profissional (%, opcional)"
          inputMode="decimal"
          placeholder="ex.: 30"
          value={form.percentualComissao}
          onChange={(e) => setForm({ ...form, percentualComissao: e.target.value })}
        />

        {erro && <p className="text-sm text-critical">{erro}</p>}

        <Botao type="submit" disabled={enviando} className="mt-2 w-full">
          {enviando ? "Salvando…" : "Registrar pagamento"}
        </Botao>
      </form>
    </Modal>
  );
}

function ModalRegistrarDespesa({ aberto, onFechar, onRegistrada }) {
  const [form, setForm] = useState(FORM_DESPESA_VAZIO);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (aberto) {
      setForm(FORM_DESPESA_VAZIO);
      setErro("");
    }
  }, [aberto]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    try {
      const valorCentavos = Math.round(parseFloat(form.valorCentavos.replace(",", ".")) * 100);
      if (!form.descricao.trim()) throw new Error("Informe a descrição.");
      if (Number.isNaN(valorCentavos) || valorCentavos <= 0) throw new Error("Informe um valor válido.");

      setEnviando(true);
      await api.post("/finance/expenses", { ...form, valorCentavos });
      mostrarMensagem({ tipo: "sucesso", texto: "Despesa registrada." });
      onRegistrada();
      onFechar();
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal aberto={aberto} onFechar={onFechar} titulo="Registrar despesa">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <CampoTexto
          id="descricao"
          rotulo="Descrição"
          required
          value={form.descricao}
          onChange={(e) => setForm({ ...form, descricao: e.target.value })}
        />
        <CampoSelecao
          id="categoria"
          rotulo="Categoria"
          value={form.categoria}
          onChange={(e) => setForm({ ...form, categoria: e.target.value })}
        >
          {Object.entries(ROTULOS_CATEGORIA_DESPESA).map(([valor, rotulo]) => (
            <option key={valor} value={valor}>
              {rotulo}
            </option>
          ))}
        </CampoSelecao>
        <CampoTexto
          id="valorCentavosDespesa"
          rotulo="Valor (R$)"
          inputMode="decimal"
          required
          value={form.valorCentavos}
          onChange={(e) => setForm({ ...form, valorCentavos: e.target.value })}
        />
        <CampoTexto
          id="dataDespesa"
          rotulo="Data"
          type="date"
          required
          value={form.data}
          onChange={(e) => setForm({ ...form, data: e.target.value })}
        />
        {erro && <p className="text-sm text-critical">{erro}</p>}
        <Botao type="submit" disabled={enviando} className="mt-2 w-full">
          {enviando ? "Salvando…" : "Registrar despesa"}
        </Botao>
      </form>
    </Modal>
  );
}

export default function Financeiro() {
  const [resumo, setResumo] = useState(null);
  const [pagamentos, setPagamentos] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalDespesaAberto, setModalDespesaAberto] = useState(false);

  function carregar() {
    setCarregando(true);
    Promise.all([api.get("/finance/summary"), api.get("/finance/payments"), api.get("/finance/expenses")])
      .then(([resumoDados, pagamentosDados, despesasDados]) => {
        setResumo(resumoDados);
        setPagamentos(pagamentosDados);
        setDespesas(despesasDados);
      })
      .finally(() => setCarregando(false));
  }

  useEffect(carregar, []);

  const colunasDespesa = [
    { chave: "data", titulo: "Data", renderizar: (d) => formatarDataHora(d.data) },
    { chave: "descricao", titulo: "Descrição" },
    {
      chave: "categoria",
      titulo: "Categoria",
      renderizar: (d) => <Etiqueta variante="neutro">{ROTULOS_CATEGORIA_DESPESA[d.categoria]}</Etiqueta>,
    },
    {
      chave: "valorCentavos",
      titulo: "Valor",
      classeCelula: "text-right tabular-nums font-medium text-critical",
      classeCabecalho: "text-right",
      renderizar: (d) => `- ${formatarDinheiro(d.valorCentavos)}`,
    },
  ];

  const colunas = [
    { chave: "pagoEm", titulo: "Data", renderizar: (p) => formatarDataHora(p.pagoEm) },
    { chave: "cliente", titulo: "Cliente", renderizar: (p) => p.agendamento.cliente.nome },
    { chave: "servico", titulo: "Serviço", renderizar: (p) => p.agendamento.servico.nome },
    {
      chave: "metodo",
      titulo: "Método",
      renderizar: (p) => <Etiqueta variante="neutro">{ROTULOS_METODO[p.metodo]}</Etiqueta>,
    },
    {
      chave: "valorCentavos",
      titulo: "Valor",
      classeCelula: "text-right tabular-nums font-medium",
      classeCabecalho: "text-right",
      renderizar: (p) => formatarDinheiro(p.valorCentavos),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">Financeiro</h1>
          <p className="mt-1 text-sm text-muted">Faturamento, pagamentos e comissões do seu salão.</p>
        </div>
        <div className="flex gap-2">
          <Botao variante="ghost" onClick={() => setModalDespesaAberto(true)}>
            <Plus className="h-4 w-4" />
            Registrar despesa
          </Botao>
          <Botao onClick={() => setModalAberto(true)}>
            <Plus className="h-4 w-4" />
            Registrar pagamento
          </Botao>
        </div>
      </div>

      {carregando ? (
        <Esqueleto.Cartoes quantidade={5} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <CartaoEstatistica icone={Wallet} rotulo="Faturamento hoje" valor={formatarDinheiro(resumo.faturamentoHojeCentavos)} />
          <CartaoEstatistica icone={TrendingUp} rotulo="Faturamento do mês" valor={formatarDinheiro(resumo.faturamentoMesCentavos)} />
          <CartaoEstatistica icone={TrendingDown} rotulo="Despesas do mês" valor={formatarDinheiro(resumo.despesasMesCentavos)} />
          <CartaoEstatistica icone={Receipt} rotulo="Ticket médio" valor={formatarDinheiro(resumo.ticketMedioCentavos)} />
          <CartaoEstatistica
            icone={Award}
            rotulo="Serviço mais vendido"
            valor={resumo.servicoMaisVendido?.nome || "—"}
          />
        </div>
      )}

      {carregando ? (
        <Esqueleto linhas={5} />
      ) : (
        <Tabela
          colunas={colunas}
          dados={pagamentos}
          vazio={
            <Mensagem
              tipo="vazio"
              titulo="Nenhum pagamento registrado ainda"
              texto="Registre o primeiro pagamento de um agendamento finalizado."
              acao={
                <Botao onClick={() => setModalAberto(true)} className="px-3.5 py-2 text-xs">
                  <Plus className="h-3.5 w-3.5" />
                  Registrar pagamento
                </Botao>
              }
            />
          }
        />
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted">Despesas</h2>
        {carregando ? (
          <Esqueleto linhas={3} />
        ) : (
          <Tabela
            colunas={colunasDespesa}
            dados={despesas}
            vazio={<Mensagem tipo="vazio" titulo="Nenhuma despesa registrada" texto="Registre aluguel, folha, produtos e outras saídas." />}
          />
        )}
      </div>

      <ModalRegistrarPagamento aberto={modalAberto} onFechar={() => setModalAberto(false)} onRegistrado={carregar} />
      <ModalRegistrarDespesa aberto={modalDespesaAberto} onFechar={() => setModalDespesaAberto(false)} onRegistrada={carregar} />
    </div>
  );
}
