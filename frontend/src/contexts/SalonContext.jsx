import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api.js";
import { resolveSalonColors } from "../lib/templates.js";

const SalonContext = createContext(null);

// Envolve as páginas públicas de um salão (site, agendamento, login com
// marca), montadas em /:salonId/.... Todas as chamadas de API usam esse
// salão explicitamente, pelo id na URL.
export function SalonProvider({ salonId, children }) {
  const publicBase = `/public/${salonId}`;
  const [salon, setSalon] = useState(null);

  useEffect(() => {
    setSalon(null);
    api
      .get(`${publicBase}/salon`)
      .then(setSalon)
      .catch(() => {});
  }, [publicBase]);

  const path = useMemo(() => (suffix = "") => `/${salonId}${suffix}`, [salonId]);

  const colors = resolveSalonColors(salon);

  const value = { salonId, publicBase, salon, path };

  return (
    <SalonContext.Provider value={value}>
      <div
        style={{ "--accent": colors.accent, "--accent-ink": colors.accentInk }}
        className="contents"
      >
        {children}
      </div>
    </SalonContext.Provider>
  );
}

export function useSalon() {
  const ctx = useContext(SalonContext);
  if (!ctx) throw new Error("useSalon deve ser usado dentro de SalonProvider");
  return ctx;
}
