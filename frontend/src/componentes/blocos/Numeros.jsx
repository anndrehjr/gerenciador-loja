import { useEffect, useRef, useState } from "react";

const COLUNAS = { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-2 sm:grid-cols-4" };

// Só anima quando o valor é um número puro (ex.: "3000", "21"). Valores com
// formato livre (ex.: "4,8/5") são exibidos direto, sem contagem — nunca
// tentamos "inventar" uma animação pra algo que não é um número simples.
function useContador(valorFinal, ativo) {
  const [exibido, setExibido] = useState(0);

  useEffect(() => {
    if (!ativo || valorFinal === null) return;
    const duracao = 1200;
    const inicio = performance.now();
    let quadro;

    function passo(agora) {
      const progresso = Math.min((agora - inicio) / duracao, 1);
      const suavizado = 1 - Math.pow(1 - progresso, 3);
      setExibido(Math.round(valorFinal * suavizado));
      if (progresso < 1) quadro = requestAnimationFrame(passo);
    }

    quadro = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(quadro);
  }, [ativo, valorFinal]);

  return exibido;
}

function ItemNumero({ item, ativo }) {
  const match = /^(\d+)(.*)$/.exec(String(item.valor).trim());
  const numero = match ? parseInt(match[1], 10) : null;
  const sufixo = match ? match[2] : "";
  const exibido = useContador(numero, ativo);

  return (
    <div className="text-center">
      <div className="text-3xl font-bold tabular-nums text-accent-ink sm:text-4xl">
        {numero !== null ? `${exibido.toLocaleString("pt-BR")}${sufixo}` : item.valor}
      </div>
      <div className="mt-1.5 text-sm text-muted">{item.label}</div>
    </div>
  );
}

// Números/estatísticas em destaque (ex.: "+3.000 clientes", "21 anos") — só
// aparece com dados reais que o dono do salão cadastrou em
// personalizacao.stats; nunca mostramos placeholder fingindo ser métrica real.
export default function Numeros({ personalizacao }) {
  const itens = personalizacao?.stats;
  const ref = useRef(null);
  const [ativo, setAtivo] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAtivo(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!Array.isArray(itens) || itens.length === 0) return null;
  const visiveis = itens.slice(0, 4);

  return (
    <section id="numeros" ref={ref} className="scroll-mt-20 border-t border-line py-16">
      <div className={`grid gap-8 ${COLUNAS[visiveis.length]}`}>
        {visiveis.map((item, i) => (
          <ItemNumero key={i} item={item} ativo={ativo} />
        ))}
      </div>
    </section>
  );
}
