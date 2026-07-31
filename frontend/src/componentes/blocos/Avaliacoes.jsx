import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

// Idem galeria: sem avaliações reais cadastradas (personalizacao.reviews,
// plano PREMIUM), o bloco não aparece — nunca depoimento inventado.
export default function Avaliacoes({ personalizacao }) {
  const avaliacoes = personalizacao?.reviews;
  const [indice, setIndice] = useState(0);
  const timeoutRef = useRef(null);

  const total = Array.isArray(avaliacoes) ? avaliacoes.length : 0;

  useEffect(() => {
    if (total < 2) return;
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIndice((i) => (i + 1) % total), 5000);
    return () => clearTimeout(timeoutRef.current);
  }, [indice, total]);

  if (total === 0) return null;

  const avaliacao = avaliacoes[indice];

  return (
    <section id="avaliacoes" className="scroll-mt-20 border-t border-line py-16">
      <h2 className="text-xl font-semibold">Avaliações</h2>
      <p className="mt-1 text-sm text-muted">O que quem já passou por aqui tem a dizer.</p>

      <div className="relative mx-auto mt-8 max-w-xl">
        {total > 1 && (
          <>
            <button
              onClick={() => setIndice((i) => (i - 1 + total) % total)}
              aria-label="Avaliação anterior"
              className="absolute left-0 top-1/2 z-10 flex h-9 w-9 -translate-x-4 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface shadow-soft transition duration-200 hover:bg-hover"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIndice((i) => (i + 1) % total)}
              aria-label="Próxima avaliação"
              className="absolute right-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 translate-x-4 items-center justify-center rounded-full border border-line bg-surface shadow-soft transition duration-200 hover:bg-hover"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        <motion.div
          key={indice}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-line bg-surface p-8 text-center shadow-soft"
        >
          <div className="flex justify-center gap-0.5">
            {Array.from({ length: 5 }).map((_, s) => (
              <Star
                key={s}
                className={`h-4 w-4 ${s < (avaliacao.rating || 5) ? "fill-accent-ink text-accent-ink" : "text-line"}`}
              />
            ))}
          </div>
          <p className="mx-auto mt-4 max-w-md text-sm italic leading-relaxed text-ink/90">"{avaliacao.text}"</p>
          <p className="mt-4 text-sm font-medium">{avaliacao.name}</p>
        </motion.div>

        {total > 1 && (
          <div className="mt-6 flex justify-center gap-1.5">
            {avaliacoes.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndice(i)}
                aria-label={`Ir para avaliação ${i + 1}`}
                className={`h-2 w-2 rounded-full transition duration-200 ${i === indice ? "bg-accent-ink" : "bg-line"}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
