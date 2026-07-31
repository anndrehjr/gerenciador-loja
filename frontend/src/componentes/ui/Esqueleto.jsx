function Bloco({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-hover ${className}`} />;
}

// Skeleton padrão de lista (linhas com avatar + duas linhas de texto) — a
// forma mais comum de tela no admin (Clientes, Serviços, Profissionais,
// Agendamentos). Use Esqueleto.Cartoes pra grid de estatística e
// Esqueleto.Bloco pra formatos avulsos.
export default function Esqueleto({ linhas = 5, className = "" }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-line bg-surface ${className}`} aria-hidden="true">
      {Array.from({ length: linhas }).map((_, i) => (
        <div key={i} className={`flex items-center gap-4 px-5 py-3.5 ${i > 0 ? "border-t border-line" : ""}`}>
          <Bloco className="h-9 w-9 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Bloco className="h-3.5 w-1/3" />
            <Bloco className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

Esqueleto.Bloco = Bloco;

Esqueleto.Cartoes = function EsqueletoCartoes({ quantidade = 3, className = "" }) {
  return (
    <div className={`grid grid-cols-2 gap-4 sm:grid-cols-3 ${className}`} aria-hidden="true">
      {Array.from({ length: quantidade }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-line bg-surface p-5">
          <Bloco className="h-3 w-16" />
          <Bloco className="mt-3 h-6 w-20" />
        </div>
      ))}
    </div>
  );
};
