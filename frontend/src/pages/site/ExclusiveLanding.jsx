import { useEffect, useState } from "react";
import { useSalon } from "../../contexts/SalonContext.jsx";
import { api } from "../../lib/api.js";
import { categoryTemplate, BLOCK_ORDER } from "../../lib/landingTemplates.js";
import { hexToRgbTriplet } from "../../lib/templates.js";
import Hero from "../../components/blocks/Hero.jsx";
import About from "../../components/blocks/About.jsx";
import ServicesCarousel from "../../components/blocks/ServicesCarousel.jsx";
import Team from "../../components/blocks/Team.jsx";
import Gallery from "../../components/blocks/Gallery.jsx";
import Reviews from "../../components/blocks/Reviews.jsx";
import InstagramBlock from "../../components/blocks/InstagramBlock.jsx";
import Faq from "../../components/blocks/Faq.jsx";
import Contact from "../../components/blocks/Contact.jsx";
import Footer from "../../components/blocks/Footer.jsx";

const BLOCKS = {
  hero: Hero,
  about: About,
  services: ServicesCarousel,
  team: Team,
  gallery: Gallery,
  reviews: Reviews,
  instagram: InstagramBlock,
  faq: Faq,
  contact: Contact,
  footer: Footer,
};

// Landing exclusiva de segmento (planos PRO/PREMIUM). Monta os blocos na
// ordem de BLOCK_ORDER, cada um lendo só as props que precisa — trocar a
// ordem ou criar um 6º template no futuro não exige tocar em nenhum bloco.
export default function ExclusiveLanding() {
  const { publicBase, salon, path } = useSalon();
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);

  useEffect(() => {
    api.get(`${publicBase}/services`).then(setServices).catch(() => {});
    api.get(`${publicBase}/professionals`).then(setProfessionals).catch(() => {});
  }, [publicBase]);

  if (!salon) {
    return <div className="flex min-h-screen items-center justify-center text-muted">Carregando…</div>;
  }

  const config = categoryTemplate(salon.category);
  const customization = salon.customization || null;
  const p = config.palette;

  // PREMIUM pode sobrescrever a cor de destaque do preset da categoria —
  // mesma lógica de "cor personalizada vence o modelo" já usada no plano
  // START, só que aplicada à paleta inteira da landing exclusiva.
  const customAccent = customization?.accentColor ? hexToRgbTriplet(customization.accentColor) : null;
  const accent = customAccent || p.accent;
  const accentInk = customAccent || p.accentInk;

  // Idem pra ordem das seções: hero sempre primeiro, rodapé sempre por
  // último, o meio é livre — assim não dá pra "sumir" com a home nem com o
  // rodapé só reordenando.
  const middleOrder =
    Array.isArray(customization?.blockOrder) && customization.blockOrder.length
      ? customization.blockOrder.filter((k) => BLOCKS[k] && k !== "hero" && k !== "footer")
      : BLOCK_ORDER.filter((k) => k !== "hero" && k !== "footer");
  const order = ["hero", ...middleOrder, "footer"];

  return (
    <div
      className="min-h-screen bg-bg text-ink"
      style={{
        "--bg": p.bg,
        "--surface": p.surface,
        "--hover": p.hover,
        "--ink": p.ink,
        "--muted": p.muted,
        "--line": p.line,
        "--accent": accent,
        "--accent-ink": accentInk,
        "--font-display": config.fontDisplay,
        "--font-body": config.fontBody,
        fontFamily: "var(--font-body)",
      }}
    >
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2 font-semibold" style={{ fontFamily: "var(--font-display)" }}>
            {salon.logoUrl ? (
              <img src={salon.logoUrl} alt={salon.name} className="h-7 w-7 rounded-lg object-cover" />
            ) : (
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-accent to-accent-ink" />
            )}
            {salon.name}
          </div>
          <a
            href="#servicos"
            className="rounded-lg bg-accent px-3.5 py-2 text-sm font-medium text-white transition duration-200 hover:opacity-90"
          >
            Agendar
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6">
        {order.map((key) => {
          const Block = BLOCKS[key];
          return <Block key={key} salon={salon} config={config} customization={customization} services={services} professionals={professionals} path={path} />;
        })}
      </main>
    </div>
  );
}
