import { MapPin, MessageCircle, ExternalLink } from "lucide-react";

export default function Contato({ salao }) {
  const partesEndereco = [salao.endereco, salao.cidade, salao.estado].filter(Boolean);
  const linhaEndereco = partesEndereco.join(", ");
  const linkMapa = linhaEndereco
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${salao.nome} - ${linhaEndereco}`)}`
    : null;
  const linkWhatsapp = salao.whatsapp ? `https://wa.me/55${salao.whatsapp.replace(/\D/g, "")}` : null;

  const srcEmbed = linhaEndereco
    ? `https://maps.google.com/maps?q=${encodeURIComponent(`${salao.nome} - ${linhaEndereco}`)}&output=embed`
    : null;

  if (!linhaEndereco && !linkWhatsapp) return null;

  return (
    <section id="contato" className="scroll-mt-20 border-t border-line py-16">
      <h2 className="text-xl font-semibold">Contato</h2>
      <ul className="mt-6 space-y-4 text-sm">
        {linhaEndereco && (
          <li className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <div>
              <div className="text-ink">{linhaEndereco}</div>
              {linkMapa && (
                <a href={linkMapa} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-accent-ink hover:underline">
                  Abrir no mapa <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </li>
        )}
        {linkWhatsapp && (
          <li className="flex items-center gap-3">
            <MessageCircle className="h-4 w-4 shrink-0 text-accent" />
            <a href={linkWhatsapp} target="_blank" rel="noreferrer" className="text-accent-ink hover:underline">
              Falar no WhatsApp
            </a>
          </li>
        )}
      </ul>

      {srcEmbed && (
        <div className="mt-6 aspect-video overflow-hidden rounded-2xl border border-line">
          <iframe
            src={srcEmbed}
            title="Localização no mapa"
            className="h-full w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}
    </section>
  );
}
