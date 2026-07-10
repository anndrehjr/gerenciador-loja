export default function StatTile({ label, value }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-5">
      <div className="text-2xl font-semibold tabular-nums text-ink">{value}</div>
      <div className="mt-1 text-sm text-muted">{label}</div>
    </div>
  );
}
