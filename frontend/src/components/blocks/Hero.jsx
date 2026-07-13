import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle } from "lucide-react";
import Button from "../ui/Button.jsx";
import { salonTypeInfo } from "../../lib/salonTypes.js";

// Duas variantes de composição — "centered" (feminino/unissex/outros, tom
// editorial) e "split" (barbearia/estética, imagem/painel ao lado do texto).
// A diferença visual entre categorias vem da paleta+fonte (herdadas via CSS
// vars do wrapper) e não de um componente Hero exclusivo por segmento.
export default function Hero({ salon, config, path, customization }) {
  const Icon = salonTypeInfo(salon.category).icon;
  const whatsappHref = salon.whatsapp ? `https://wa.me/55${salon.whatsapp.replace(/\D/g, "")}` : null;
  const eyebrow = customization?.heroEyebrow || config.copy.eyebrow;
  const headline = customization?.heroHeadline || config.copy.heroHeadline;
  const subheadline = customization?.heroSubheadline || config.copy.heroSubheadline;

  const actions = (
    <div className="flex flex-wrap items-center gap-3">
      <Link to={path("/agendar")}>
        <Button>
          Agendar horário
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
      {whatsappHref && (
        <a href={whatsappHref} target="_blank" rel="noreferrer">
          <Button variant="ghost">
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </Button>
        </a>
      )}
    </div>
  );

  if (config.heroVariant === "split") {
    return (
      <section className="grid grid-cols-1 items-center gap-10 py-20 sm:py-28 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-ink">{eyebrow}</p>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.08] text-balance sm:text-5xl" style={{ fontFamily: "var(--font-display)" }}>
            {headline}
          </h1>
          <p className="mt-5 max-w-md text-base text-muted">{subheadline}</p>
          <div className="mt-8">{actions}</div>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-line">
          {salon.logoUrl ? (
            <img src={salon.logoUrl} alt={salon.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent/25 via-surface to-accent-ink/20">
              <Icon className="h-16 w-16 text-accent-ink/70" />
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden py-24 text-center sm:py-32">
      <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-gradient-to-br from-accent/20 to-accent-ink/10 blur-3xl" />
      <div className="relative mx-auto max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-ink">{eyebrow}</p>
        <h1
          className="mt-4 text-4xl font-semibold leading-[1.08] text-balance sm:text-6xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {headline}
        </h1>
        <p className="mx-auto mt-5 max-w-md text-base text-muted">{subheadline}</p>
        <div className="mt-8 flex justify-center">{actions}</div>
      </div>
    </section>
  );
}
