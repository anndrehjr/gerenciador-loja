import { useEffect, useState } from "react";
import { Plus, PackagePlus, PackageMinus, AlertTriangle, X } from "lucide-react";
import { api } from "../../biblioteca/api.js";
import { formatarDinheiro } from "../../biblioteca/formatacao.js";
import { mostrarMensagem } from "../../contextos/ContextoNotificacoes.jsx";
import Botao from "../../componentes/ui/Botao.jsx";
import CampoTexto from "../../componentes/ui/CampoTexto.jsx";
import CampoSelecao from "../../componentes/ui/CampoSelecao.jsx";
import Tabela from "../../componentes/ui/Tabela.jsx";
import Modal from "../../componentes/ui/Modal.jsx";
import Esqueleto from "../../componentes/ui/Esqueleto.jsx";
import Mensagem from "../../componentes/ui/Mensagem.jsx";
import Etiqueta from "../../componentes/ui/Etiqueta.jsx";
import CartaoEstatistica from "../../componentes/ui/CartaoEstatistica.jsx";

const FORM_PRODUTO_VAZIO = { nome: "", precoCentavos: "", estoqueMinimo: "5", categoriaId: "", validade: "" };

function EtiquetaEstoque({ produto }) {
  const vencido = produto.validade && new Date(produto.validade) < new Date();
  if (vencido) return <Etiqueta variante="erro">Vencido</Etiqueta>;
  if (produto.estoqueAtual < produto.estoqueMinimo) return <Etiqueta variante="alerta">Estoque baixo</Etiqueta>;
  return <Etiqueta variante="sucesso">Ok</Etiqueta>;
}

function ModalMovimentacao({ produto, onFechar, onRegistrada }) {
  const [tipo, setTipo] = useState("ENTRADA");
  const [quantidade, setQuantidade] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    const qtd = parseInt(quantidade, 10);
    if (Number.isNaN(qtd) || qtd <= 0) {
      setErro("Informe uma quantidade válida.");
      return;
    }
    setEnviando(true);
    try {
      await api.post(`/inventory/produtos/${produto.id}/movimentacoes`, { tipo, quantidade: qtd });
      mostrarMensagem({ tipo: "sucesso", texto: "Movimentação registrada." });
      onRegistrada();
      onFechar();
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal aberto={Boolean(produto)} onFechar={onFechar} titulo={`Movimentar estoque — ${produto?.nome}`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <CampoSelecao id="tipo" rotulo="Tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="ENTRADA">Entrada</option>
          <option value="SAIDA">Saída</option>
        </CampoSelecao>
        <CampoTexto
          id="quantidade"
          rotulo="Quantidade"
          type="number"
          min="1"
          required
          value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)}
        />
        {erro && <p className="text-sm text-critical" role="alert">{erro}</p>}
        <Botao type="submit" disabled={enviando} className="w-full">
          {enviando ? "Salvando…" : "Registrar"}
        </Botao>
      </form>
    </Modal>
  );
}

export default function Estoque() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState(FORM_PRODUTO_VAZIO);
  const [erro, setErro] = useState("");
  const [produtoMovimentando, setProdutoMovimentando] = useState(null);

  function carregar() {
    setCarregando(true);
    Promise.all([api.get("/inventory/produtos"), api.get("/inventory/categorias")])
      .then(([p, c]) => {
        setProdutos(p);
        setCategorias(c);
      })
      .finally(() => setCarregando(false));
  }

  useEffect(carregar, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    try {
      const precoCentavos = Math.round(parseFloat(form.precoCentavos.replace(",", ".")) * 100);
      if (Number.isNaN(precoCentavos) || precoCentavos < 0) throw new Error("Informe um preço válido.");
      await api.post("/inventory/produtos", {
        nome: form.nome,
        precoCentavos,
        estoqueMinimo: parseInt(form.estoqueMinimo, 10) || 0,
        categoriaId: form.categoriaId || null,
        validade: form.validade || null,
      });
      setMostrarForm(false);
      setForm(FORM_PRODUTO_VAZIO);
      carregar();
      mostrarMensagem({ tipo: "sucesso", texto: "Produto cadastrado." });
    } catch (err) {
      setErro(err.message);
      mostrarMensagem({ tipo: "erro", texto: err.message });
    }
  }

  const baixoEstoque = produtos.filter((p) => p.estoqueAtual < p.estoqueMinimo).length;
  const vencidos = produtos.filter((p) => p.validade && new Date(p.validade) < new Date()).length;

  const colunas = [
    { chave: "nome", titulo: "Produto", renderizar: (p) => (
      <div>
        <div className="font-medium">{p.nome}</div>
        <div className="text-xs text-muted">{p.categoria?.nome || "Sem categoria"}</div>
      </div>
    ) },
    { chave: "estoqueAtual", titulo: "Estoque", classeCelula: "tabular-nums", renderizar: (p) => `${p.estoqueAtual} un.` },
    { chave: "precoCentavos", titulo: "Preço", classeCelula: "tabular-nums", renderizar: (p) => formatarDinheiro(p.precoCentavos) },
    { chave: "status", titulo: "Status", renderizar: (p) => <EtiquetaEstoque produto={p} /> },
    {
      chave: "acoes",
      titulo: "",
      classeCabecalho: "text-right",
      classeCelula: "text-right",
      renderizar: (p) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => setProdutoMovimentando(p)}
            className="rounded-lg p-2 text-muted transition duration-200 hover:bg-hover hover:text-accent-ink"
            aria-label="Registrar entrada"
          >
            <PackagePlus className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">Estoque</h1>
          <p className="mt-1 text-sm text-muted">Produtos, categorias e movimentações.</p>
        </div>
        <Botao onClick={() => setMostrarForm(true)}>
          <Plus className="h-4 w-4" />
          Novo produto
        </Botao>
      </div>

      {carregando ? (
        <Esqueleto.Cartoes quantidade={3} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <CartaoEstatistica icone={PackageMinus} rotulo="Produtos cadastrados" valor={produtos.length} />
          <CartaoEstatistica icone={AlertTriangle} rotulo="Estoque baixo" valor={baixoEstoque} />
          <CartaoEstatistica icone={AlertTriangle} rotulo="Vencidos" valor={vencidos} />
        </div>
      )}

      {mostrarForm && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-6 shadow-soft sm:flex-row sm:flex-wrap sm:items-end"
        >
          <CampoTexto id="nome" rotulo="Nome" required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          <CampoTexto
            id="precoCentavos"
            rotulo="Preço (R$)"
            inputMode="decimal"
            required
            value={form.precoCentavos}
            onChange={(e) => setForm({ ...form, precoCentavos: e.target.value })}
          />
          <CampoTexto
            id="estoqueMinimo"
            rotulo="Estoque mínimo"
            type="number"
            min="0"
            value={form.estoqueMinimo}
            onChange={(e) => setForm({ ...form, estoqueMinimo: e.target.value })}
          />
          <CampoSelecao
            id="categoriaId"
            rotulo="Categoria"
            value={form.categoriaId}
            onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}
          >
            <option value="">Sem categoria</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </CampoSelecao>
          <CampoTexto
            id="validade"
            rotulo="Validade (opcional)"
            type="date"
            value={form.validade}
            onChange={(e) => setForm({ ...form, validade: e.target.value })}
          />
          <div className="flex gap-2">
            <Botao type="submit">Adicionar</Botao>
            <Botao type="button" variante="ghost" onClick={() => setMostrarForm(false)}>
              <X className="h-4 w-4" />
              Cancelar
            </Botao>
          </div>
          {erro && <p className="w-full text-sm text-critical" role="alert">{erro}</p>}
        </form>
      )}

      {carregando ? (
        <Esqueleto linhas={6} />
      ) : (
        <Tabela
          colunas={colunas}
          dados={produtos}
          vazio={
            <Mensagem
              tipo="vazio"
              titulo="Nenhum produto cadastrado"
              texto="Cadastre o primeiro produto pra começar a controlar o estoque."
              acao={
                <Botao onClick={() => setMostrarForm(true)} className="px-3.5 py-2 text-xs">
                  <Plus className="h-3.5 w-3.5" />
                  Novo produto
                </Botao>
              }
            />
          }
        />
      )}

      <ModalMovimentacao produto={produtoMovimentando} onFechar={() => setProdutoMovimentando(null)} onRegistrada={carregar} />
    </div>
  );
}
