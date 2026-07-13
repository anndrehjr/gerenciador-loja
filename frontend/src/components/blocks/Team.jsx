function Initials({ name }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent/25 to-accent-ink/20 text-lg font-semibold text-accent-ink">
      {initials}
    </div>
  );
}

export default function Team({ professionals }) {
  if (!professionals.length) return null;

  return (
    <section id="equipe" className="border-t border-line py-16">
      <h2 className="text-xl font-semibold">Equipe</h2>
      <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {professionals.map((p) => (
          <div key={p.id} className="text-center">
            <div className="mx-auto h-20 w-20 overflow-hidden rounded-full border border-line">
              {p.photoUrl ? (
                <img src={p.photoUrl} alt={p.name} className="h-full w-full object-cover" />
              ) : (
                <Initials name={p.name} />
              )}
            </div>
            <div className="mt-3 text-sm font-medium">{p.name}</div>
            {p.specialty && <div className="text-xs text-muted">{p.specialty}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}
