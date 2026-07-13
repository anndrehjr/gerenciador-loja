export default function About({ config, customization }) {
  const title = customization?.aboutTitle || config.copy.aboutTitle;
  const text = customization?.aboutText || config.copy.aboutText;
  if (!text) return null;

  return (
    <section id="sobre" className="border-t border-line py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">{title}</h2>
        <p className="mt-4 text-lg leading-relaxed text-ink/90" style={{ fontFamily: "var(--font-display)" }}>
          {text}
        </p>
      </div>
    </section>
  );
}
