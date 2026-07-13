import { MapPin, MessageCircle, ExternalLink } from "lucide-react";

export default function Contact({ salon }) {
  const addressParts = [salon.address, salon.city, salon.state].filter(Boolean);
  const addressLine = addressParts.join(", ");
  const mapsHref = addressLine
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${salon.name} - ${addressLine}`)}`
    : null;
  const whatsappHref = salon.whatsapp ? `https://wa.me/55${salon.whatsapp.replace(/\D/g, "")}` : null;

  if (!addressLine && !whatsappHref) return null;

  return (
    <section id="contato" className="border-t border-line py-16">
      <h2 className="text-xl font-semibold">Contato</h2>
      <ul className="mt-6 space-y-4 text-sm">
        {addressLine && (
          <li className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <div>
              <div className="text-ink">{addressLine}</div>
              {mapsHref && (
                <a href={mapsHref} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-accent-ink hover:underline">
                  Abrir no mapa <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </li>
        )}
        {whatsappHref && (
          <li className="flex items-center gap-3">
            <MessageCircle className="h-4 w-4 shrink-0 text-accent" />
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="text-accent-ink hover:underline">
              Falar no WhatsApp
            </a>
          </li>
        )}
      </ul>
    </section>
  );
}
