import { Moon, Sun } from "lucide-react";
import { useTema } from "../contextos/ContextoTema.jsx";

export default function AlternadorTema() {
  const { escuro, alternar } = useTema();
  return (
    <button
      onClick={alternar}
      aria-label={escuro ? "Ativar tema claro" : "Ativar tema escuro"}
      className="rounded-lg p-2 text-muted transition duration-200 hover:bg-hover hover:text-ink"
    >
      {escuro ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
