const VARIANTS = {
  primary:
    "bg-gradient-to-b from-accent to-accent-ink text-white shadow-soft hover:shadow-glow hover:-translate-y-0.5",
  ghost:
    "text-ink border border-line bg-transparent hover:bg-hover hover:-translate-y-0.5",
  danger:
    "bg-critical text-white hover:opacity-90 hover:-translate-y-0.5",
};

export default function Button({ variant = "primary", className = "", ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 active:translate-y-0 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
