const VARIANTES = {
  primary:
    "bg-gradient-to-b from-accent to-accent-ink text-white shadow-soft hover:shadow-glow hover:-translate-y-0.5",
  ghost:
    "text-ink border border-line bg-transparent hover:bg-hover hover:-translate-y-0.5",
  danger:
    "bg-critical text-white hover:opacity-90 hover:-translate-y-0.5",
};

export default function Botao({ variante = "primary", pilula = false, className = "", ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 ${pilula ? "rounded-full" : "rounded-xl"} px-4 py-2.5 text-sm font-medium transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 active:translate-y-0 outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg ${VARIANTES[variante]} ${className}`}
      {...props}
    />
  );
}
