const VARIANTES = {
  neutro: "bg-hover text-muted",
  accent: "bg-accent/10 text-accent-ink",
  sucesso: "bg-success/10 text-success",
  alerta: "bg-warning/10 text-warning",
  erro: "bg-critical/10 text-critical",
};

export default function Etiqueta({ variante = "neutro", className = "", children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${VARIANTES[variante]} ${className}`}
    >
      {children}
    </span>
  );
}
