import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X, Clock, ArrowRight, UserRound } from "lucide-react";
import { formatarDinheiro, formatarDuracao } from "../../biblioteca/formatacao.js";
import { infoTipoSalao } from "../../biblioteca/tiposSalao.js";
import Botao from "../ui/Botao.jsx";

function ModalServico({ servico, salao, caminho, onFechar }) {
  const Icone = infoTipoSalao(salao.categoria).icone;

  useEffect(() => {
    function aoTeclar(e) {
      if (e.key === "Escape") onFechar();
    }
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [onFechar]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onFechar}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-line bg-surface shadow-soft"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onFechar}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white transition duration-200 hover:bg-black/50"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex h-40 items-center justify-center bg-gradient-to-br from-accent/25 via-surface to-accent-ink/20">
          <Icone className="h-14 w-14 text-accent-ink/70" />
        </div>
        <div className="p-6">
          <h3 className="text-lg font-semibold">{servico.nome}</h3>
          {servico.descricao && <p className="mt-2 text-sm text-muted">{servico.descricao}</p>}
          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="font-semibold tabular-nums text-accent-ink">{formatarDinheiro(servico.precoCentavos)}</span>
            <span className="flex items-center gap-1.5 text-muted">
              <Clock className="h-3.5 w-3.5" />
              {formatarDuracao(servico.duracaoMinutos)}
            </span>
          </div>
          {servico.profissionais?.length > 0 && (
            <div className="mt-3 flex items-start gap-1.5 text-sm text-muted">
              <UserRound className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>Com {servico.profissionais.map((p) => p.nome).join(", ")}</span>
            </div>
          )}
          <Link to={caminho("/agendar")} className="mt-6 block">
            <Botao className="w-full">
              Agendar agora
              <ArrowRight className="h-4 w-4" />
            </Botao>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CarrosselServicos({ servicos, salao, caminho }) {
  const [selecionado, setSelecionado] = useState(null);
  const Icone = infoTipoSalao(salao.categoria).icone;

  if (!servicos.length) return null;

  return (
    <section id="servicos" className="scroll-mt-20 border-t border-line py-16">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Serviços</h2>
        <span className="text-xs text-muted">Arraste para o lado →</span>
      </div>

      <div className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {servicos.map((servico) => (
          <button
            key={servico.id}
            onClick={() => setSelecionado(servico)}
            className="group w-60 shrink-0 snap-start overflow-hidden rounded-2xl border border-line bg-surface text-left transition duration-200 hover:-translate-y-1 hover:shadow-soft"
          >
            <div className="flex h-28 items-center justify-center bg-gradient-to-br from-accent/20 via-surface to-accent-ink/15 transition duration-200 group-hover:from-accent/30">
              <Icone className="h-9 w-9 text-accent-ink/70" />
            </div>
            <div className="p-4">
              <div className="font-medium">{servico.nome}</div>
              {servico.descricao && (
                <div className="mt-1 line-clamp-2 text-xs text-muted">{servico.descricao}</div>
              )}
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="font-semibold tabular-nums text-accent-ink">{formatarDinheiro(servico.precoCentavos)}</span>
                <span className="flex items-center gap-1 text-xs text-muted">
                  <Clock className="h-3 w-3" />
                  {formatarDuracao(servico.duracaoMinutos)}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {selecionado && (
        <ModalServico servico={selecionado} salao={salao} caminho={caminho} onFechar={() => setSelecionado(null)} />
      )}
    </section>
  );
}
