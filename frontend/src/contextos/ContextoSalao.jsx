import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../biblioteca/api.js";
import { resolverTemaSalao } from "../biblioteca/modelos.js";

const ContextoSalao = createContext(null);

// Envolve as páginas públicas de um salão (site, agendamento, login com
// marca), montadas em /:salaoId/.... Todas as chamadas de API usam esse
// salão explicitamente, pelo id na URL.
export function ProvedorSalao({ salaoId, children }) {
  const basePublica = `/public/${salaoId}`;
  const [salao, setSalao] = useState(null);

  useEffect(() => {
    setSalao(null);
    api
      .get(`${basePublica}/salon`)
      .then(setSalao)
      .catch(() => {});
  }, [basePublica]);

  const caminho = useMemo(() => (sufixo = "") => `/${salaoId}${sufixo}`, [salaoId]);

  const tema = resolverTemaSalao(salao);

  const valor = { salaoId, basePublica, salao, caminho };

  // Só os modelos que definem paleta própria (hoje, "vitrine-elegante")
  // sobrescrevem bg/surface/ink/etc. — os demais deixam esses campos
  // undefined, então o React nem escreve a propriedade e o tema claro/escuro
  // global continua valendo normalmente.
  const estiloTema = {
    "--accent": tema.accent,
    "--accent-ink": tema.accentInk,
    "--bg": tema.bg,
    "--surface": tema.surface,
    "--hover": tema.hover,
    "--ink": tema.ink,
    "--muted": tema.muted,
    "--line": tema.line,
    "--font-display": tema.fonteDisplay,
    fontFamily: tema.fonteSans,
  };

  return (
    <ContextoSalao.Provider value={valor}>
      <div style={estiloTema} className="contents">
        {children}
      </div>
    </ContextoSalao.Provider>
  );
}

export function useSalao() {
  const ctx = useContext(ContextoSalao);
  if (!ctx) throw new Error("useSalao deve ser usado dentro de ProvedorSalao");
  return ctx;
}
