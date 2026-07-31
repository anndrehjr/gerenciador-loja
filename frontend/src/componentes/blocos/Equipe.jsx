function Iniciais({ nome }) {
  const iniciais = nome
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent/25 to-accent-ink/20 text-3xl font-semibold text-accent-ink">
      {iniciais}
    </div>
  );
}

export default function Equipe({ profissionais }) {
  if (!profissionais.length) return null;

  return (
    <section id="equipe" className="scroll-mt-20 border-t border-line py-16">
      <h2 className="text-xl font-semibold">Equipe</h2>
      <p className="mt-1 text-sm text-muted">Passe o mouse pra conhecer cada profissional.</p>
      <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {profissionais.map((p) => (
          <div key={p.id} className="overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="group relative h-56 overflow-hidden sm:h-64">
              {p.urlFoto ? (
                <img
                  src={p.urlFoto}
                  alt={p.nome}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />
              ) : (
                <Iniciais nome={p.nome} />
              )}
              {p.bio && (
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 transition duration-300 group-hover:opacity-100">
                  <p className="translate-y-2 p-4 text-xs leading-relaxed text-white transition duration-300 group-hover:translate-y-0">
                    {p.bio}
                  </p>
                </div>
              )}
            </div>
            <div className="p-4 text-center">
              <div className="text-sm font-medium">{p.nome}</div>
              {p.especialidade && <div className="text-xs text-muted">{p.especialidade}</div>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
