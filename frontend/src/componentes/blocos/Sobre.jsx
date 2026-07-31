export default function Sobre({ config, personalizacao }) {
  const titulo = personalizacao?.aboutTitle || config.copy.aboutTitle;
  const texto = personalizacao?.aboutText || config.copy.aboutText;
  if (!texto) return null;

  return (
    <section id="sobre" className="scroll-mt-20 border-t border-line py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">{titulo}</h2>
        <p className="mt-4 text-lg leading-relaxed text-ink/90" style={{ fontFamily: "var(--font-display)" }}>
          {texto}
        </p>
      </div>
    </section>
  );
}
