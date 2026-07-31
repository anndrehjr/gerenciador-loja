import { useSalao } from "../../contextos/ContextoSalao.jsx";
import { recursosDoPlano } from "../../biblioteca/planos.js";
import InicioSite from "./InicioSite.jsx";
import PaginaExclusivaSegmento from "./PaginaExclusivaSegmento.jsx";

// Decide, uma vez que o salão carregou, entre a landing genérica (plano
// START) e a landing exclusiva por segmento (PRO/PREMIUM). Fica num
// componente só pra não espalhar essa checagem em cada rota.
export default function PaginaSite() {
  const { salao } = useSalao();

  if (!salao) {
    return <div className="flex min-h-screen items-center justify-center text-muted">Carregando…</div>;
  }

  return recursosDoPlano(salao.plano).templateExclusivo ? <PaginaExclusivaSegmento /> : <InicioSite />;
}
