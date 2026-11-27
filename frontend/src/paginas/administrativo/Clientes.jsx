import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, X, ChevronRight } from "lucide-react";
import { api } from "../../biblioteca/api.js";
import { mostrarMensagem } from "../../contextos/ContextoNotificacoes.jsx";
import Botao from "../../componentes/ui/Botao.jsx";
import CampoTexto from "../../componentes/ui/CampoTexto.jsx";
import Esqueleto from "../../componentes/ui/Esqueleto.jsx";
import Mensagem from "../../componentes/ui/Mensagem.jsx";
import Etiqueta from "../../componentes/ui/Etiqueta.jsx";

const FORM_VAZIO = { nome: "", email: "", telefone: "" };

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [form, setForm] = useState(FORM_VAZIO);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [erro, setErro] = useState("");

  function carregar() {
    setCarregando(true);
    api
      .get("/clients")
      .then(setClientes)
      .finally(() => setCarregando(false));
  }

  useEffect(carregar, []);

  function iniciarCriacao() {
    setForm(FORM_VAZIO);
    setErro("");
    setMostrarForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    try {
      const payload = { ...form, email: form.email || null, telefone: form.telefone || null };
      await api.post("/clients", payload);
      setMostrarForm(false);
      carregar();
      mostrarMensagem({ tipo: "sucesso", texto: "Cliente salvo com sucesso." });
    } catch (err) {
      setErro(err.message);
      mostrarMensagem({ tipo: "erro", texto: err.message });
    }
  }

  const filtrados = clientes.filter((c) =>
    c.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-lg font-semibold">Clientes</h1>
        <Botao onClick={iniciarCriacao}>
          <Plus className="h-4 w-4" />
          Novo cliente
        </Botao>
      </div>

      <CampoTexto
        placeholder="Buscar por nome…"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="max-w-xs"
      />

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
            id="email"
            rotulo="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <CampoTexto
            id="telefone"
            rotulo="Telefone"
            value={form.telefone}
            onChange={(e) => setForm({ ...form, telefone: e.target.value })}
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
        <Esqueleto linhas={5} />
      ) : filtrados.length === 0 ? (
        <Mensagem
          tipo="vazio"
          titulo={busca ? "Nenhum cliente encontrado" : "Nenhum cliente ainda"}
          texto={busca ? "Tente buscar por outro nome." : "Cadastre o primeiro cliente do seu salão."}
          acao={
            !busca && (
              <Botao onClick={iniciarCriacao} className="px-3.5 py-2 text-xs">
                <Plus className="h-3.5 w-3.5" />
                Novo cliente
              </Botao>
            )
          }
        />
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {filtrados.map((cliente) => (
            <li key={cliente.id} className="transition duration-200 hover:bg-hover">
              <Link to={`/clients/${cliente.id}`} className="flex items-center gap-3 px-5 py-3.5">
                {cliente.urlFoto ? (
                  <img src={cliente.urlFoto} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
                ) : (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent/25 to-accent-ink/15 text-xs font-semibold text-accent-ink">
                    {cliente.nome
                      .split(" ")
                      .slice(0, 2)
                      .map((p) => p[0])
                      .join("")}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {cliente.nome}
                    {cliente.vip && <Etiqueta variante="accent">VIP</Etiqueta>}
                  </div>
                  <div className="truncate text-sm text-muted">
                    {[cliente.email, cliente.telefone].filter(Boolean).join(" · ") || "—"}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
