export default function StatTile({ icon: Icon, label, value }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-line bg-surface p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-soft">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-accent/15 to-accent-ink/10 blur-2xl transition duration-200 group-hover:from-accent/25" />
      <div className="relative flex items-center justify-between">
        <div className="text-sm text-muted">{label}</div>
        {Icon && (
          <div className="rounded-lg bg-gradient-to-br from-accent/15 to-accent-ink/10 p-2 text-accent-ink">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className="relative mt-3 text-2xl font-semibold tabular-nums text-ink">{value}</div>
    </div>
  );
}
