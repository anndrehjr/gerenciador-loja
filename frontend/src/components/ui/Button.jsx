const VARIANTS = {
  primary: "bg-accent text-white hover:opacity-90",
  ghost: "text-ink hover:bg-surface border border-line",
  danger: "bg-critical text-white hover:opacity-90",
};

export default function Button({ variant = "primary", className = "", ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
