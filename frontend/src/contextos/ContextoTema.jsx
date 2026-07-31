import { createContext, useContext, useEffect, useState } from "react";

const ContextoTema = createContext(null);

export function ProvedorTema({ children }) {
  const [escuro, setEscuro] = useState(() => {
    const salvo = localStorage.getItem("theme");
    return salvo ? salvo === "dark" : true;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", escuro);
    localStorage.setItem("theme", escuro ? "dark" : "light");
  }, [escuro]);

  return (
    <ContextoTema.Provider value={{ escuro, alternar: () => setEscuro((d) => !d) }}>
      {children}
    </ContextoTema.Provider>
  );
}

export function useTema() {
  const ctx = useContext(ContextoTema);
  if (!ctx) throw new Error("useTema deve ser usado dentro de ProvedorTema");
  return ctx;
}
