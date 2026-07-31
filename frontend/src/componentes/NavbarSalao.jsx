import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Botao from "./ui/Botao.jsx";

const LINKS = [
  { href: "#sobre", rotulo: "Sobre" },
  { href: "#servicos", rotulo: "Serviços" },
  { href: "#equipe", rotulo: "Equipe" },
  { href: "#contato", rotulo: "Contato" },
];

// Fica transparente sobre a foto do hero e vira sólida ao rolar — só entra
// no modo transparente quando o salão tem banner (garante contraste sempre;
// sem foto, a paleta da categoria varia demais em claridade pra arriscar
// texto claro direto sobre o fundo).
export default function NavbarSalao({ salao, caminho, temFundoHero }) {
  const [solido, setSolido] = useState(!temFundoHero);
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    if (!temFundoHero) return;
    function aoRolar() {
      setSolido(window.scrollY > 60);
    }
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, [temFundoHero]);

  const textoClaro = temFundoHero && !solido;

  return (
    <motion.header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        solido ? "border-b border-line bg-surface/90 py-3 shadow-soft backdrop-blur-md" : "border-b border-transparent bg-transparent py-5"
      }`}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6">
        <div
          className={`flex items-center gap-2 font-semibold ${textoClaro ? "text-white" : "text-ink"}`}
          style={{ fontFamily: "var(--font-display)" }}
        >
          {salao.urlLogo ? (
            <img src={salao.urlLogo} alt={salao.nome} className="h-7 w-7 rounded-lg object-cover" />
          ) : (
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-accent to-accent-ink" />
          )}
          {salao.nome}
        </div>

        <nav className="hidden items-center gap-7 text-sm sm:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`transition duration-200 ${
                textoClaro ? "text-white/85 hover:text-white" : "text-muted hover:text-ink"
              }`}
            >
              {link.rotulo}
            </a>
          ))}
          <Link to={caminho("/agendar")}>
            <Botao pilula className="px-4 py-2 text-xs">
              Agendar
            </Botao>
          </Link>
        </nav>

        <button
          onClick={() => setMenuAberto((v) => !v)}
          className={`flex h-9 w-9 items-center justify-center rounded-lg sm:hidden ${textoClaro ? "text-white" : "text-ink"}`}
          aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuAberto}
        >
          {menuAberto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuAberto && (
        <nav className="flex flex-col gap-1 border-t border-line bg-surface px-6 py-4 text-sm sm:hidden">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuAberto(false)}
              className="rounded-lg px-2 py-2.5 text-muted transition duration-200 hover:bg-hover hover:text-ink"
            >
              {link.rotulo}
            </a>
          ))}
          <Link
            to={caminho("/agendar")}
            onClick={() => setMenuAberto(false)}
            className="mt-2 rounded-lg bg-accent px-2 py-2.5 text-center font-medium text-white"
          >
            Agendar
          </Link>
        </nav>
      )}
    </motion.header>
  );
}
