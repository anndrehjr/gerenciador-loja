import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Store, Users, CalendarClock, ExternalLink, Search } from "lucide-react";
import { api } from "../../biblioteca/api.js";
import CartaoEstatistica from "../../componentes/ui/CartaoEstatistica.jsx";
import Botao from "../../componentes/ui/Botao.jsx";
import CampoTexto from "../../componentes/ui/CampoTexto.jsx";
import CampoSelecao from "../../componentes/ui/CampoSelecao.jsx";
import Etiqueta from "../../componentes/ui/Etiqueta.jsx";
import Carregamento from "../../componentes/ui/Carregamento.jsx";
import ModalDetalheSalao from "./ModalDetalheSalao.jsx";

const FILTROS_STATUS = [
  { value: "TODOS", label: "Todos" },
  { value: "ATIVO", label: "Ativos" },
  { value: "SUSPENSO", label: "Suspensos" },
];

function urlPublicaDoSalao(salao) {
  return salao.dominio ? `https://${salao.dominio}` : `${window.location.origin}/${salao.slug}`;
}

function CartaoSalao({ salao, onAbrir }) {
  return (
    <button
      onClick={onAbrir}
      className="group flex flex-col rounded-2xl border border-line bg-surface p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-soft"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="truncate font-medium">{salao.nome}</span>
        <Etiqueta variante={salao.status === "ATIVO" ? "sucesso" : "erro"} className="shrink-0">
          {salao.status === "ATIVO" ? "Ativo" : "Suspenso"}
        </Etiqueta>
      </div>

      <a
        href={urlPublicaDoSalao(salao)}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="mt-1.5 inline-flex items-center gap-1 truncate text-xs text-accent-ink hover:underline"
      >
        {salao.dominio || `${window.location.origin}/${salao.slug}`}
        <ExternalLink className="h-3 w-3 shrink-0" />
      </a>

      <Etiqueta variante="neutro" className="mt-3 w-fit">
        plano {salao.plano}
      </Etiqueta>

      <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-line pt-3 text-xs text-muted">
        <span>{salao._count.clientes} clientes</span>
        <span>{salao._count.profissionais} profissionais</span>
        <span>{salao._count.servicos} serviços</span>
        <span>{salao._count.agendamentos} agendamentos</span>
      </div>
    </button>
  );
}

export default function PainelMestre() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [saloes, setSaloes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("TODOS");

  function carregar() {
    setCarregando(true);
    api
      .get("/master/salons")
      .then(setSaloes)
      .finally(() => setCarregando(false));
  }

  useEffect(carregar, []);

  const totais = saloes.reduce(
    (acc, s) => ({
      clientes: acc.clientes + s._count.clientes,
      agendamentos: acc.agendamentos + s._count.agendamentos,
      ativos: acc.ativos + (s.status === "ATIVO" ? 1 : 0),
    }),
    { clientes: 0, agendamentos: 0, ativos: 0 }
  );

  const saloesFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return saloes.filter((s) => {
      if (filtroStatus !== "TODOS" && s.status !== filtroStatus) return false;
      if (!termo) return true;
      return (
        s.nome.toLowerCase().includes(termo) ||
        s.slug.toLowerCase().includes(termo) ||
        (s.dominio || "").toLowerCase().includes(termo)
      );
    });
  }, [saloes, busca, filtroStatus]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Salões</h1>
          <p className="mt-1 text-sm text-muted">Todos os salões cadastrados na plataforma.</p>
        </div>
        <Botao onClick={() => navigate("/master/salons/new")}>
          <Plus className="h-4 w-4" />
          Novo salão
        </Botao>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <CartaoEstatistica icone={Store} rotulo="Salões ativos" valor={`${totais.ativos} / ${saloes.length}`} />
        <CartaoEstatistica icone={Users} rotulo="Clientes (todos os salões)" valor={totais.clientes} />
        <CartaoEstatistica icone={CalendarClock} rotulo="Agendamentos (todos)" valor={totais.agendamentos} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <CampoTexto
            id="buscaSaloes"
            placeholder="Buscar por nome, slug ou domínio…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10"
          />
        </div>
        <CampoSelecao
          id="filtroStatus"
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="sm:w-44"
        >
          {FILTROS_STATUS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </CampoSelecao>
      </div>

      {carregando ? (
        <Carregamento texto="Carregando…" />
      ) : saloesFiltrados.length === 0 ? (
        <p className="text-sm text-muted">Nenhum salão encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {saloesFiltrados.map((salao) => (
            <CartaoSalao key={salao.id} salao={salao} onAbrir={() => navigate(`/master/salons/${salao.id}`)} />
          ))}
        </div>
      )}

      <ModalDetalheSalao
        salaoId={id || null}
        onFechar={() => navigate("/master")}
        onAtualizado={carregar}
      />
    </div>
  );
}
