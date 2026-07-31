export default function PerguntasFrequentes({ config, personalizacao }) {
  const itens = personalizacao?.faq || config.copy.faq;
  if (!itens?.length) return null;

  return (
    <section id="faq" className="scroll-mt-20 border-t border-line py-16">
      <h2 className="text-xl font-semibold">Perguntas frequentes</h2>
      <div className="mt-6 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
        {itens.map((item) => (
          <div key={item.q} className="px-5 py-4">
            <div className="font-medium">{item.q}</div>
            <div className="mt-1 text-sm text-muted">{item.a}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
