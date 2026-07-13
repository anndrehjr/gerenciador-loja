import { useSalon } from "../../contexts/SalonContext.jsx";
import { planFeatures } from "../../lib/plans.js";
import SiteHome from "./SiteHome.jsx";
import ExclusiveLanding from "./ExclusiveLanding.jsx";

// Decide, uma vez que o salão carregou, entre a landing genérica (plano
// START) e a landing exclusiva por segmento (PRO/PREMIUM). Fica num
// componente só pra não espalhar essa checagem em cada rota.
export default function SitePage() {
  const { salon } = useSalon();

  if (!salon) {
    return <div className="flex min-h-screen items-center justify-center text-muted">Carregando…</div>;
  }

  return planFeatures(salon.plan).exclusiveTemplate ? <ExclusiveLanding /> : <SiteHome />;
}
