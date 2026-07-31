import { useEffect, useState } from "react";
import { useSalao } from "../../contextos/ContextoSalao.jsx";
import { api } from "../../biblioteca/api.js";
import { modeloPorCategoria, ORDEM_BLOCOS } from "../../biblioteca/modelosPorCategoria.js";
import { hexParaRgb } from "../../biblioteca/modelos.js";
import Hero from "../../componentes/blocos/Hero.jsx";
import Sobre from "../../componentes/blocos/Sobre.jsx";
import CarrosselServicos from "../../componentes/blocos/CarrosselServicos.jsx";
import Produtos from "../../componentes/blocos/Produtos.jsx";
import Equipe from "../../componentes/blocos/Equipe.jsx";
import Galeria from "../../componentes/blocos/Galeria.jsx";
import Avaliacoes from "../../componentes/blocos/Avaliacoes.jsx";
import Numeros from "../../componentes/blocos/Numeros.jsx";
import CortesFeitos from "../../componentes/blocos/CortesFeitos.jsx";
import BlocoInstagram from "../../componentes/blocos/BlocoInstagram.jsx";
import PerguntasFrequentes from "../../componentes/blocos/PerguntasFrequentes.jsx";
import Contato from "../../componentes/blocos/Contato.jsx";
import Rodape from "../../componentes/blocos/Rodape.jsx";
import BotaoWhatsappFlutuante from "../../componentes/BotaoWhatsappFlutuante.jsx";
import NavbarSalao from "../../componentes/NavbarSalao.jsx";

// Chaves em inglês de propósito — casam com ORDEM_BLOCOS, que preserva o
// vocabulário de uma possível personalizacao.blockOrder já salva no banco.
const BLOCOS = {
  hero: Hero,
  about: Sobre,
  services: CarrosselServicos,
  products: Produtos,
  team: Equipe,
  gallery: Galeria,
  reviews: Avaliacoes,
  stats: Numeros,
  finishedWork: CortesFeitos,
  instagram: BlocoInstagram,
  faq: PerguntasFrequentes,
  contact: Contato,
  footer: Rodape,
};

// Landing exclusiva de segmento (planos PRO/PREMIUM). Monta os blocos na
// ordem de ORDEM_BLOCOS, cada um lendo só as props que precisa — trocar a
// ordem ou criar um 6º modelo no futuro não exige tocar em nenhum bloco.
export default function PaginaExclusivaSegmento() {
  const { basePublica, salao, caminho } = useSalao();
  const [servicos, setServicos] = useState([]);
  const [profissionais, setProfissionais] = useState([]);

  useEffect(() => {
    api.get(`${basePublica}/services`).then(setServicos).catch(() => {});
    api.get(`${basePublica}/professionals`).then(setProfissionais).catch(() => {});
  }, [basePublica]);

  if (!salao) {
    return <div className="flex min-h-screen items-center justify-center text-muted">Carregando…</div>;
  }

  const config = modeloPorCategoria(salao.categoria);
  const personalizacao = salao.personalizacao || null;
  const p = config.palette;

  // PREMIUM pode sobrescrever a cor de destaque do preset da categoria —
  // mesma lógica de "cor personalizada vence o modelo" já usada no plano
  // START, só que aplicada à paleta inteira da landing exclusiva.
  const corPersonalizada = personalizacao?.accentColor ? hexParaRgb(personalizacao.accentColor) : null;
  const accent = corPersonalizada || p.accent;
  const accentInk = corPersonalizada || p.accentInk;

  // Idem pra fonte do título — PREMIUM pode trocar por qualquer uma das
  // fontes já carregadas, sobrescrevendo a padrão da categoria.
  const fontDisplay = personalizacao?.fontDisplay || config.fontDisplay;

  // Idem pra ordem das seções: hero sempre primeiro, rodapé sempre por
  // último, o meio é livre — assim não dá pra "sumir" com a home nem com o
  // rodapé só reordenando.
  const ordemMeio =
    Array.isArray(personalizacao?.blockOrder) && personalizacao.blockOrder.length
      ? personalizacao.blockOrder.filter((k) => BLOCOS[k] && k !== "hero" && k !== "footer")
      : ORDEM_BLOCOS.filter((k) => k !== "hero" && k !== "footer");
  const ordem = ["hero", ...ordemMeio, "footer"];

  return (
    <div
      className="min-h-screen bg-bg text-ink"
      style={{
        "--bg": p.bg,
        "--surface": p.surface,
        "--hover": p.hover,
        "--ink": p.ink,
        "--muted": p.muted,
        "--line": p.line,
        "--accent": accent,
        "--accent-ink": accentInk,
        "--font-display": fontDisplay,
        "--font-body": config.fontBody,
        fontFamily: "var(--font-body)",
      }}
    >
      <NavbarSalao salao={salao} caminho={caminho} temFundoHero={Boolean(salao.urlBanner)} />
      {!salao.urlBanner && <div className="h-20" />}

      <main className="mx-auto max-w-3xl px-6">
        {ordem.map((chave) => {
          const Bloco = BLOCOS[chave];
          return (
            <Bloco
              key={chave}
              salao={salao}
              config={config}
              personalizacao={personalizacao}
              servicos={servicos}
              profissionais={profissionais}
              caminho={caminho}
            />
          );
        })}
      </main>

      <BotaoWhatsappFlutuante salao={salao} />
    </div>
  );
}
