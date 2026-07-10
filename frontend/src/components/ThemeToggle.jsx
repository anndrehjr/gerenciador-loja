import { Moon, Sun } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext.jsx";

export default function ThemeToggle() {
  const { dark, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Ativar tema claro" : "Ativar tema escuro"}
      className="rounded-full p-2 text-muted hover:bg-surface hover:text-ink"
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
