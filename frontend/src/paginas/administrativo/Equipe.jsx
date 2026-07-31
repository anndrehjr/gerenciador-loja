import { useEffect, useState } from "react";
import { Plus, Trash2, X, UserCog } from "lucide-react";
import { api } from "../../biblioteca/api.js";
import { mostrarMensagem } from "../../contextos/ContextoNotificacoes.jsx";
import { useAutenticacao } from "../../contextos/ContextoAutenticacao.jsx";
import Botao from "../../componentes/ui/Botao.jsx";
import CampoTexto from "../../componentes/ui/CampoTexto.jsx";
import CampoSelecao from "../../componentes/ui/CampoSelecao.jsx";
import Esqueleto from "../../componentes/ui/Esqueleto.jsx";
import Mensagem from "../../componentes/ui/Mensagem.jsx";
import Etiqueta from "../../componentes/ui/Etiqueta.jsx";

const ROTULOS_PAPEL = { DONO: "Dono", GERENTE: "Gerente", PROFISSIONAL: "Profissional", RECEPCIONISTA: "Recepcionista" };
const VARIANTE_PAPEL = { DONO: "accent", GERENTE: "sucesso", PROFISSIONAL: "neutro", RECEPCIONISTA: "neutro" };
const FORM_VAZIO = { nome: "", email: "", senha: "", papel: "RECEPCIONISTA", profissionalId: "" };

export default function Equipe() {
  const { usuario } = useAutenticacao();
  const [equipe, setEquipe] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState(FORM_VAZIO);
  const [erro, setErro] = useState("");

  function carregar() {
    setCarregando(true);
    api
      .get("/team")
      .then(setEquipe)
      .finally(() => setCarregando(false));
  }

  useEffect(carregar, []);
  useEffect(() => {
    api.get("/professionals").then(setProfissionais);
  }, []);

  function iniciarConvite() {
    setForm(FORM_VAZIO);
    setErro("");
    setMostrarForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    try {
      await api.post("/team", {
        ...form,
        profissionalId: form.papel === "PROFISSIONAL" ? form.profissionalId || null : null,
      });
      setMostrarForm(false);
      carregar();
      mostrarMensagem({ tipo: "sucesso", texto: "Membro da equipe adicionado com sucesso." });
    } catch (err) {
      setErro(err.message);
      mostrarMensagem({ tipo: "erro", texto: err.message });
    }
  }

  async function handleMudarPapel(membro, papel) {
    try {
      await api.patch(`/team/${membro.id}`, { papel, profissionalId: membro.profissionalId });
      carregar();
      mostrarMensagem({ tipo: "sucesso", texto: "Papel atualizado." });
    } catch (err) {
      mostrarMensagem({ tipo: "erro", texto: err.message });
    }
  }

  async function handleRemover(membro) {
    if (!window.confirm(`Remover ${membro.usuario.nome} da equipe? O acesso dessa pessoa ao sistema será desativado.`))
      return;
    try {
      await api.delete(`/team/${membro.id}`);
      carregar();
      mostrarMensagem({ tipo: "sucesso", texto: "Membro removido." });
    } catch (err) {
      mostrarMensagem({ tipo: "erro", texto: err.message });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">Equipe</h1>
          <p className="mt-1 text-sm text-muted">Quem tem acesso ao painel do seu salão, e com qual papel.</p>
        </div>
        <Botao onClick={iniciarConvite}>
          <Plus className="h-4 w-4" />
          Adicionar membro
        </Botao>
      </div>

      {mostrarForm && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-6 shadow-soft sm:flex-row sm:flex-wrap sm:items-end"
        >
          <CampoTexto
            id="nome"
            rotulo="Nome"
            required
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />
          <CampoTexto
            id="email"
            rotulo="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <CampoTexto
            id="senha"
            rotulo="Senha inicial"
            type="password"
            minLength={8}
            required
            value={form.senha}
            onChange={(e) => setForm({ ...form, senha: e.target.value })}
          />
          <CampoSelecao
            id="papel"
            rotulo="Papel"
            value={form.papel}
            onChange={(e) => setForm({ ...form, papel: e.target.value })}
          >
            {Object.entries(ROTULOS_PAPEL).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo}
              </option>
            ))}
          </CampoSelecao>
          {form.papel === "PROFISSIONAL" && (
            <CampoSelecao
              id="profissionalId"
              rotulo="Vincular à agenda de"
              value={form.profissionalId}
              onChange={(e) => setForm({ ...form, profissionalId: e.target.value })}
            >
              <option value="">Selecione…</option>
              {profissionais.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </CampoSelecao>
          )}
          <div className="flex gap-2">
            <Botao type="submit">Adicionar</Botao>
            <Botao type="button" variante="ghost" onClick={() => setMostrarForm(false)}>
              <X className="h-4 w-4" />
              Cancelar
            </Botao>
          </div>
          {erro && <p className="w-full text-sm text-critical">{erro}</p>}
        </form>
      )}

      {carregando ? (
        <Esqueleto linhas={4} />
      ) : equipe.length === 0 ? (
        <Mensagem tipo="vazio" titulo="Só você por enquanto" texto="Adicione gerentes, recepcionistas ou profissionais com login próprio." />
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {equipe.map((membro) => (
            <li key={membro.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm font-medium">
                  {membro.usuario.nome}
                  {membro.usuario.id === usuario?.id && <span className="text-xs text-muted">(você)</span>}
                </div>
                <div className="text-sm text-muted">
                  {membro.usuario.email}
                  {membro.profissional && (
                    <span className="ml-1 inline-flex items-center gap-1">
                      · <UserCog className="h-3 w-3" /> agenda de {membro.profissional.nome}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <select
                  value={membro.papel}
                  onChange={(e) => handleMudarPapel(membro, e.target.value)}
                  disabled={membro.usuario.id === usuario?.id}
                  className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm outline-none transition duration-200 focus:border-accent focus:ring-2 focus:ring-accent/25 disabled:opacity-50"
                >
                  {Object.entries(ROTULOS_PAPEL).map(([valor, rotulo]) => (
                    <option key={valor} value={valor}>
                      {rotulo}
                    </option>
                  ))}
                </select>
                <Etiqueta variante={VARIANTE_PAPEL[membro.papel]}>{ROTULOS_PAPEL[membro.papel]}</Etiqueta>
                <button
                  onClick={() => handleRemover(membro)}
                  disabled={membro.usuario.id === usuario?.id}
                  className="rounded-lg p-2 text-muted transition duration-200 hover:bg-bg hover:text-critical disabled:opacity-30"
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
