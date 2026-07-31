import { useEffect, useState } from "react";
import { Pencil, Check, X as IconeX } from "lucide-react";
import { api } from "../../biblioteca/api.js";
import { mostrarMensagem } from "../../contextos/ContextoNotificacoes.jsx";
import Botao from "../../componentes/ui/Botao.jsx";
import CampoTexto from "../../componentes/ui/CampoTexto.jsx";
import Etiqueta from "../../componentes/ui/Etiqueta.jsx";
import Carregamento from "../../componentes/ui/Carregamento.jsx";
import { formatarDinheiro } from "../../biblioteca/formatacao.js";

function EditorPlano({ plano, onSalvar, onCancelar, salvando }) {
  const [nome, setNome] = useState(plano.nome);
  const [preco, setPreco] = useState((plano.precoCentavos / 100).toFixed(2).replace(".", ","));
  const [maxProfissionais, setMaxProfissionais] = useState(plano.limites?.maxProfissionais ?? "");
  const [maxAgendamentosMes, setMaxAgendamentosMes] = useState(plano.limites?.maxAgendamentosMes ?? "");

  function handleSubmit(e) {
    e.preventDefault();
    const precoCentavos = Math.round(parseFloat(preco.replace(",", ".").replace(/[^\d.]/g, "")) * 100) || 0;
    onSalvar({
      nome,
      precoCentavos,
      limites: {
        maxProfissionais: maxProfissionais === "" ? null : Number(maxProfissionais),
        maxAgendamentosMes: maxAgendamentosMes === "" ? null : Number(maxAgendamentosMes),
      },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <CampoTexto id={`nome-${plano.id}`} rotulo="Nome do plano" required value={nome} onChange={(e) => setNome(e.target.value)} />
      <CampoTexto
        id={`preco-${plano.id}`}
        rotulo="Preço mensal (R$)"
        inputMode="decimal"
        placeholder="0,00"
        value={preco}
        onChange={(e) => setPreco(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-4">
        <CampoTexto
          id={`maxProf-${plano.id}`}
          rotulo="Limite de profissionais"
          type="number"
          min="0"
          placeholder="Sem limite"
          value={maxProfissionais}
          onChange={(e) => setMaxProfissionais(e.target.value)}
        />
        <CampoTexto
          id={`maxAgend-${plano.id}`}
          rotulo="Limite de agendamentos/mês"
          type="number"
          min="0"
          placeholder="Sem limite"
          value={maxAgendamentosMes}
          onChange={(e) => setMaxAgendamentosMes(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Botao type="submit" disabled={salvando}>
          <Check className="h-4 w-4" />
          {salvando ? "Salvando…" : "Salvar"}
        </Botao>
        <Botao type="button" variante="ghost" onClick={onCancelar} disabled={salvando}>
          <IconeX className="h-4 w-4" />
          Cancelar
        </Botao>
      </div>
    </form>
  );
}

function CartaoPlano({ plano, onSalvo }) {
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  async function handleSalvar(dados) {
    setSalvando(true);
    try {
      const atualizado = await api.patch(`/master/plans/${plano.id}`, dados);
      onSalvo(atualizado);
      setEditando(false);
      mostrarMensagem({ tipo: "sucesso", texto: `Plano ${atualizado.nome} atualizado.` });
    } catch (err) {
      mostrarMensagem({ tipo: "erro", texto: err.message });
    } finally {
      setSalvando(false);
    }
  }

  async function handleAlternarAtivo() {
    try {
      const atualizado = await api.patch(`/master/plans/${plano.id}`, { ativo: !plano.ativo });
      onSalvo(atualizado);
    } catch (err) {
      mostrarMensagem({ tipo: "erro", texto: err.message });
    }
  }

  return (
    <div className="flex flex-col rounded-2xl border border-line bg-surface p-6">
      {editando ? (
        <EditorPlano plano={plano} onSalvar={handleSalvar} onCancelar={() => setEditando(false)} salvando={salvando} />
      ) : (
        <>
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold">{plano.nome}</span>
                <Etiqueta variante="neutro">{plano.chave}</Etiqueta>
              </div>
              <div className="mt-2 text-2xl font-semibold tabular-nums">
                {plano.precoCentavos > 0 ? (
                  <>
                    {formatarDinheiro(plano.precoCentavos)} <span className="text-sm font-normal text-muted">/ mês</span>
                  </>
                ) : (
                  <span className="text-base font-medium text-muted">Sob consulta</span>
                )}
              </div>
            </div>
            <button
              onClick={() => setEditando(true)}
              className="rounded-lg p-2 text-muted transition duration-200 hover:bg-hover hover:text-ink"
              aria-label="Editar plano"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>

          <dl className="mt-5 flex-1 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Profissionais</dt>
              <dd className="font-medium">{plano.limites?.maxProfissionais ?? "Sem limite"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Agendamentos/mês</dt>
              <dd className="font-medium">{plano.limites?.maxAgendamentosMes ?? "Sem limite"}</dd>
            </div>
          </dl>

          <button
            onClick={handleAlternarAtivo}
            className="mt-5 flex items-center justify-between rounded-xl border border-line px-3.5 py-2.5 text-sm transition duration-200 hover:bg-hover"
          >
            <span className="text-muted">Disponível para novos salões</span>
            <Etiqueta variante={plano.ativo ? "sucesso" : "erro"}>{plano.ativo ? "Ativo" : "Inativo"}</Etiqueta>
          </button>
        </>
      )}
    </div>
  );
}

export default function Planos() {
  const [planos, setPlanos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    api
      .get("/master/plans")
      .then(setPlanos)
      .finally(() => setCarregando(false));
  }, []);

  function atualizarNaLista(planoAtualizado) {
    setPlanos((atual) => atual.map((p) => (p.id === planoAtualizado.id ? planoAtualizado : p)));
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-lg font-semibold">Planos</h1>
        <p className="mt-1 text-sm text-muted">Preço e limites de cada plano oferecido na plataforma.</p>
      </div>

      {carregando ? (
        <Carregamento texto="Carregando…" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {planos.map((plano) => (
            <CartaoPlano key={plano.id} plano={plano} onSalvo={atualizarNaLista} />
          ))}
        </div>
      )}
    </div>
  );
}
