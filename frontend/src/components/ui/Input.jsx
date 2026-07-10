export default function Input({ label, id, className = "", ...props }) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5 text-sm">
      {label && <span className="font-medium text-ink">{label}</span>}
      <input
        id={id}
        className={`rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent ${className}`}
        {...props}
      />
    </label>
  );
}
