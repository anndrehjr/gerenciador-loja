import { Loader2 } from "lucide-react";

export default function Carregamento({ texto, tamanho = "h-4 w-4", className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2 text-sm text-muted ${className}`} role="status">
      <Loader2 className={`animate-spin ${tamanho}`} />
      {texto}
    </span>
  );
}
