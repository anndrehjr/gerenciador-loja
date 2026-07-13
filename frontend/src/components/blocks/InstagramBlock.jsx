import { Instagram, ArrowRight } from "lucide-react";

export default function InstagramBlock({ customization }) {
  const handle = customization?.instagramHandle;
  if (!handle) return null;

  return (
    <section id="instagram" className="border-t border-line py-16">
      <a
        href={`https://instagram.com/${handle.replace(/^@/, "")}`}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-between rounded-2xl border border-line bg-gradient-to-br from-accent/10 to-accent-ink/10 p-6 transition duration-200 hover:-translate-y-0.5"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white">
            <Instagram className="h-5 w-5" />
          </div>
          <div>
            <div className="font-medium">@{handle.replace(/^@/, "")}</div>
            <div className="text-xs text-muted">Acompanhe no Instagram</div>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-muted" />
      </a>
    </section>
  );
}
