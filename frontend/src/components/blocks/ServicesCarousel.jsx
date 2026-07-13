import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X, Clock, ArrowRight } from "lucide-react";
import { formatMoney, formatDuration } from "../../lib/format.js";
import { salonTypeInfo } from "../../lib/salonTypes.js";
import Button from "../ui/Button.jsx";

function ServiceModal({ service, salon, path, onClose }) {
  const Icon = salonTypeInfo(salon.category).icon;

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-line bg-surface shadow-soft"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white transition duration-200 hover:bg-black/50"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex h-40 items-center justify-center bg-gradient-to-br from-accent/25 via-surface to-accent-ink/20">
          <Icon className="h-14 w-14 text-accent-ink/70" />
        </div>
        <div className="p-6">
          <h3 className="text-lg font-semibold">{service.name}</h3>
          {service.description && <p className="mt-2 text-sm text-muted">{service.description}</p>}
          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="font-semibold tabular-nums text-accent-ink">{formatMoney(service.priceCents)}</span>
            <span className="flex items-center gap-1.5 text-muted">
              <Clock className="h-3.5 w-3.5" />
              {formatDuration(service.durationMinutes)}
            </span>
          </div>
          <Link to={path("/agendar")} className="mt-6 block">
            <Button className="w-full">
              Agendar agora
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ServicesCarousel({ services, salon, path }) {
  const [selected, setSelected] = useState(null);
  const Icon = salonTypeInfo(salon.category).icon;

  if (!services.length) return null;

  return (
    <section id="servicos" className="border-t border-line py-16">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Serviços</h2>
        <span className="text-xs text-muted">Arraste para o lado →</span>
      </div>

      <div className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => setSelected(service)}
            className="group w-60 shrink-0 snap-start overflow-hidden rounded-2xl border border-line bg-surface text-left transition duration-200 hover:-translate-y-1 hover:shadow-soft"
          >
            <div className="flex h-28 items-center justify-center bg-gradient-to-br from-accent/20 via-surface to-accent-ink/15 transition duration-200 group-hover:from-accent/30">
              <Icon className="h-9 w-9 text-accent-ink/70" />
            </div>
            <div className="p-4">
              <div className="font-medium">{service.name}</div>
              {service.description && (
                <div className="mt-1 line-clamp-2 text-xs text-muted">{service.description}</div>
              )}
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="font-semibold tabular-nums text-accent-ink">{formatMoney(service.priceCents)}</span>
                <span className="flex items-center gap-1 text-xs text-muted">
                  <Clock className="h-3 w-3" />
                  {formatDuration(service.durationMinutes)}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {selected && <ServiceModal service={selected} salon={salon} path={path} onClose={() => setSelected(null)} />}
    </section>
  );
}
