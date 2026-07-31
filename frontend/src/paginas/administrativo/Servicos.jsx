import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { api } from "../../biblioteca/api.js";
import { formatarDinheiro } from "../../biblioteca/formatacao.js";
import Botao from "../../componentes/ui/Botao.jsx";
import CampoTexto from "../../componentes/ui/CampoTexto.jsx";

const FORM_VAZIO = { nome: "", descricao: "", preco: "", duracaoMinutos: "30", ativo: true, idsProfissionais: [] };

export default function Servicos() {
  const [servicos, setServicos] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [idEmEdicao, setIdEmEdicao] = useState(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [erro, setErro] = useState("");

  function carregar() {
    setCarregando(true);
    api
      .get("/services")
      .then(setServicos)
      .finally(() => setCarregando(false));
  }

  useEffect(carregar, []);
  useEffect(() => {
    api.get("/professionals").then(setProfissionais);
  }, []);

  function alternarProfissional(id) {
    setForm((f) => ({
      ...f,
      idsProfissionais: f.idsProfissionais.includes(id)
        ? f.idsProfissionais.filter((p) => p !== id)
        : [...f.idsProfissionais, id],
    }));
  }

  function iniciarCriacao() {
    setIdEmEdicao(null);
    setForm(FORM_VAZIO);
    setErro("");
    setMostrarForm(true);
  }

  function iniciarEdicao(servico) {
    setIdEmEdicao(servico.id);
    setForm({
      nome: servico.nome,
      descricao: servico.descricao || "",
      preco: (servico.precoCentavos / 100).toString(),
      duracaoMinutos: String(servico.duracaoMinutos),
      ativo: servico.ativo,
      idsProfissionais: (servico.profissionais || []).map((p) => p.id),
    });
    setErro("");
    setMostrarForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    try {
      const precoCentavos = Math.round(parseFloat(form.preco.replace(",", ".")) * 100);
      if (Number.isNaN(precoCentavos) || precoCentavos < 0) {
        throw new Error("Informe um preço válido.");
      }
      const duracaoMinutos = parseInt(form.duracaoMinutos, 10);
      if (Number.isNaN(duracaoMinutos) || duracaoMinutos <= 0) {
        throw new Error("Informe uma duração válida.");
      }
      const payload = {
        nome: form.nome,
        descricao: form.descricao || null,
        precoCentavos,
        duracaoMinutos,
        ativo: form.ativo,
        profissionalIds: form.idsProfissionais,
      };
      if (idEmEdicao) {
        await api.patch(`/services/${idEmEdicao}`, payload);
      } else {
        await api.post("/services", payload);
      }
      setMostrarForm(false);
      carregar();
    } catch (err) {
      setErro(err.message);
    }
  }

  async function handleExcluir(id) {
    if (!window.confirm("Remover este serviço?")) return;
    await api.delete(`/services/${id}`);
    carregar();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-lg font-semibold">Serviços</h1>
        <Botao onClick={iniciarCriacao}>
          <Plus className="h-4 w-4" />
          Novo serviço
        </Botao>
      </div>

      {mostrarForm && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-6 shadow-soft sm:flex-row sm:items-end sm:flex-wrap"
        >
          <CampoTexto
            id="nome"
            rotulo="Nome"
            required
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />
          <CampoTexto
            id="descricao"
            rotulo="Descrição"
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          />
          <CampoTexto
            id="preco"
            rotulo="Preço (R$)"
            inputMode="decimal"
            required
            value={form.preco}
            onChange={(e) => setForm({ ...form, preco: e.target.value })}
          />
          <CampoTexto
            id="duracaoMinutos"
            rotulo="Duração (min)"
            type="number"
            min="1"
            required
            value={form.duracaoMinutos}
            onChange={(e) => setForm({ ...form, duracaoMinutos: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.ativo}
              onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
            />
            Ativo no site
          </label>

          {profissionais.length > 0 && (
            <div className="w-full">
              <span className="text-sm font-medium text-ink">
                Profissionais que realizam esse serviço (opcional)
              </span>
              <p className="mt-0.5 text-xs text-muted">Sem nenhum marcado, qualquer profissional pode atender.</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {profissionais.map((p) => {
                  const marcado = form.idsProfissionais.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => alternarProfissional(p.id)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition duration-200 ${
                        marcado ? "border-accent bg-accent/10 text-accent-ink" : "border-line text-muted hover:bg-hover"
                      }`}
                    >
                      {p.nome}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Botao type="submit">{idEmEdicao ? "Salvar" : "Adicionar"}</Botao>
            <Botao type="button" variante="ghost" onClick={() => setMostrarForm(false)}>
              <X className="h-4 w-4" />
              Cancelar
            </Botao>
          </div>
          {erro && <p className="w-full text-sm text-critical">{erro}</p>}
        </form>
      )}

      {carregando ? (
        <p className="text-sm text-muted">Carregando…</p>
      ) : servicos.length === 0 ? (
        <p className="text-sm text-muted">Nenhum serviço cadastrado.</p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {servicos.map((servico) => (
            <li
              key={servico.id}
              className="flex items-center justify-between gap-4 px-5 py-3.5 transition duration-200 hover:bg-hover"
            >
              <div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  {servico.nome}
                  {!servico.ativo && (
                    <span className="rounded-full bg-hover px-2 py-0.5 text-xs text-muted">
                      Inativo
                    </span>
                  )}
                </div>
                {servico.descricao && (
                  <div className="text-sm text-muted">{servico.descricao}</div>
                )}
                {servico.profissionais?.length > 0 && (
                  <div className="mt-0.5 text-xs text-muted">
                    Com {servico.profissionais.map((p) => p.nome).join(", ")}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted">{servico.duracaoMinutos} min</span>
                <span className="tabular-nums text-sm font-medium">
                  {formatarDinheiro(servico.precoCentavos)}
                </span>
                <button
                  onClick={() => iniciarEdicao(servico)}
                  className="rounded-lg p-2 text-muted transition duration-200 hover:bg-bg hover:text-ink"
                  aria-label="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleExcluir(servico.id)}
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
