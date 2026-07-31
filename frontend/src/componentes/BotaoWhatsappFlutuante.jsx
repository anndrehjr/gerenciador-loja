import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";

// Botão fixo no canto da tela, sempre visível, pra contato rápido — só
// aparece se o salão tiver um WhatsApp cadastrado (nunca um placeholder).
export default function BotaoWhatsappFlutuante({ salao }) {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setVisivel(true), 600);
    return () => clearTimeout(timeout);
  }, []);

  if (!salao?.whatsapp) return null;

  const link = `https://wa.me/55${salao.whatsapp.replace(/\D/g, "")}`;

  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar no WhatsApp"
      className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-soft transition duration-300 hover:scale-105 hover:shadow-glow active:scale-95 motion-reduce:transition-none ${
        visivel ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
