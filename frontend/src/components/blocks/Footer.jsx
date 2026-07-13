export default function Footer({ salon, config }) {
  return (
    <footer className="border-t border-line py-10 text-center">
      <div className="text-sm font-medium" style={{ fontFamily: "var(--font-display)" }}>
        {salon.name}
      </div>
      <p className="mt-1 text-xs text-muted">
        {config.copy.eyebrow} · © {new Date().getFullYear()}
      </p>
    </footer>
  );
}
