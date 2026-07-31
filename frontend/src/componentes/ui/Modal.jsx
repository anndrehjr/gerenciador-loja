import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({
  aberto,
  onFechar,
  titulo,
  children,
  className = "max-w-md",
  semPadding = false,
  semBotaoFechar = false,
}) {
  useEffect(() => {
    if (!aberto) return;
    function aoTeclar(e) {
      if (e.key === "Escape") onFechar();
    }
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [aberto, onFechar]);

  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onFechar}
    >
      <div
        className={`relative flex w-full flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-soft ${className}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
      >
        {!semBotaoFechar && (
          <button
            onClick={onFechar}
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white transition duration-200 hover:bg-black/50"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {titulo && (
          <div className="border-b border-line px-6 py-4">
            <h2 className="text-lg font-semibold">{titulo}</h2>
          </div>
        )}
        {/* semPadding: o conteúdo controla seu próprio padding/scroll — usado
            pelos paineis grandes (ex.: detalhe de salão) que precisam de
            cabeçalho/rodapé fixos com só o meio rolando. */}
        <div className={semPadding ? "flex min-h-0 flex-1 flex-col" : "p-6"}>{children}</div>
      </div>
    </div>
  );
}
