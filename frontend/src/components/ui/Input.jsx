export default function Input({ label, id, className = "", ...props }) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5 text-sm">
      {label && <span className="font-medium text-ink">{label}</span>}
      <input
        id={id}
        className={`rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition duration-200 placeholder:text-muted/60 focus:border-accent focus:ring-2 focus:ring-accent/25 ${className}`}
        {...props}
      />
    </label>
  );
}
