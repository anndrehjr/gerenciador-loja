import { Star } from "lucide-react";

// Idem galeria: sem avaliações reais cadastradas (customization.reviews,
// plano PREMIUM), o bloco não aparece — nunca depoimento inventado.
export default function Reviews({ customization }) {
  const reviews = customization?.reviews;
  if (!Array.isArray(reviews) || reviews.length === 0) return null;

  return (
    <section id="avaliacoes" className="border-t border-line py-16">
      <h2 className="text-xl font-semibold">Avaliações</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {reviews.slice(0, 6).map((r, i) => (
          <div key={i} className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star
                  key={s}
                  className={`h-3.5 w-3.5 ${s < (r.rating || 5) ? "fill-accent-ink text-accent-ink" : "text-line"}`}
                />
              ))}
            </div>
            <p className="mt-3 text-sm text-ink/90">{r.text}</p>
            <p className="mt-3 text-xs font-medium text-muted">{r.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
