import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle } from "lucide-react";
import Botao from "../ui/Botao.jsx";
import { infoTipoSalao } from "../../biblioteca/tiposSalao.js";

const tituloVariants = {
  escondido: { opacity: 0, y: 30 },
  visivel: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const botaoVariants = {
  escondido: { opacity: 0, scale: 0.9 },
  visivel: { opacity: 1, scale: 1, transition: { delay: 0.3, duration: 0.4 } },
};

// Três composições — "foto" (quando o salão tem banner: imagem de fundo em
// tela cheia com overlay na cor do segmento, igual ao hero de referência),
// "split" (barbearia/estética sem banner) e "centered" (demais categorias
// sem banner). A cor vem sempre da paleta da categoria, nunca fixa.
export default function Hero({ salao, config, caminho, personalizacao }) {
  const Icone = infoTipoSalao(salao.categoria).icone;
  const linkWhatsapp = salao.whatsapp ? `https://wa.me/55${salao.whatsapp.replace(/\D/g, "")}` : null;
  const eyebrow = personalizacao?.heroEyebrow || config.copy.eyebrow;
  const titulo = personalizacao?.heroHeadline || config.copy.heroHeadline;
  const subtitulo = personalizacao?.heroSubheadline || config.copy.heroSubheadline;

  const acoes = (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Link to={caminho("/agendar")}>
        <Botao>
          Agendar horário
          <ArrowRight className="h-4 w-4" />
        </Botao>
      </Link>
      {linkWhatsapp && (
        <a href={linkWhatsapp} target="_blank" rel="noreferrer">
          <Botao variante="ghost">
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </Botao>
        </a>
      )}
    </div>
  );

  if (salao.urlBanner) {
    return (
      <section className="relative left-1/2 flex h-screen w-screen min-h-[560px] -translate-x-1/2 items-center justify-center overflow-hidden text-center">
        <div className="absolute inset-0">
          <img src={salao.urlBanner} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-accent/50 via-black/40 to-black/70" />
        </div>

        <div className="relative z-10 mx-auto max-w-2xl px-6">
          <motion.p
            className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            {eyebrow}
          </motion.p>
          <motion.h1
            className="mt-4 text-4xl font-semibold leading-[1.08] text-balance text-white sm:text-6xl"
            style={{ fontFamily: "var(--font-display)" }}
            initial="escondido"
            animate="visivel"
            variants={tituloVariants}
          >
            {titulo}
          </motion.h1>
          <motion.p
            className="mx-auto mt-5 max-w-md text-base text-white/85"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            {subtitulo}
          </motion.p>
          <motion.div className="mt-8" initial="escondido" animate="visivel" variants={botaoVariants}>
            {acoes}
          </motion.div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-bg to-transparent" />
      </section>
    );
  }

  if (config.heroVariant === "split") {
    return (
      <section className="grid grid-cols-1 items-center gap-10 py-20 sm:py-28 lg:grid-cols-2 lg:gap-16">
        <motion.div initial="escondido" animate="visivel" variants={tituloVariants}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-ink">{eyebrow}</p>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.08] text-balance sm:text-5xl" style={{ fontFamily: "var(--font-display)" }}>
            {titulo}
          </h1>
          <p className="mt-5 max-w-md text-base text-muted">{subtitulo}</p>
          <div className="mt-8">{acoes}</div>
        </motion.div>
        <motion.div
          className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-line"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          {salao.urlLogo ? (
            <img src={salao.urlLogo} alt={salao.nome} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent/25 via-surface to-accent-ink/20">
              <Icone className="h-16 w-16 text-accent-ink/70" />
            </div>
          )}
        </motion.div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden py-24 text-center sm:py-32">
      <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-gradient-to-br from-accent/20 to-accent-ink/10 blur-3xl" />
      <div className="relative mx-auto max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-ink">{eyebrow}</p>
        <motion.h1
          className="mt-4 text-4xl font-semibold leading-[1.08] text-balance sm:text-6xl"
          style={{ fontFamily: "var(--font-display)" }}
          initial="escondido"
          animate="visivel"
          variants={tituloVariants}
        >
          {titulo}
        </motion.h1>
        <p className="mx-auto mt-5 max-w-md text-base text-muted">{subtitulo}</p>
        <motion.div className="mt-8 flex justify-center" initial="escondido" animate="visivel" variants={botaoVariants}>
          {acoes}
        </motion.div>
      </div>
    </section>
  );
}
