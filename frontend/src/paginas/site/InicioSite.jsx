import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Scissors, MapPin, MessageCircle, ArrowRight } from "lucide-react";
import { api } from "../../biblioteca/api.js";
import { formatarDinheiro } from "../../biblioteca/formatacao.js";
import { useSalao } from "../../contextos/ContextoSalao.jsx";
import { modeloPorCategoria } from "../../biblioteca/modelosPorCategoria.js";
import { infoTipoSalao } from "../../biblioteca/tiposSalao.js";
import AlternadorTema from "../../componentes/AlternadorTema.jsx";
import Botao from "../../componentes/ui/Botao.jsx";

export default function InicioSite() {
  const { basePublica, salao, caminho } = useSalao();
  const [servicos, setServicos] = useState([]);
  const [erroCarregamento, setErroCarregamento] = useState(false);

  useEffect(() => {
    api
      .get(`${basePublica}/services`)
      .then(setServicos)
      .catch(() => setErroCarregamento(true));
  }, [basePublica]);

  if (!salao) {
    return <div className="flex min-h-screen items-center justify-center text-muted">Carregando…</div>;
  }

  const nomeSalao = salao.nome || "Salão";
  // Copy padrão por categoria (a mesma já usada na landing exclusiva
  // PRO/PREMIUM) — assim a página fala do jeito certo pro tipo de negócio,
  // sem depender de o dono do START ter escrito nada.
  const copy = modeloPorCategoria(salao.categoria).copy;
  const Icone = infoTipoSalao(salao.categoria).icone;
  const linkWhatsapp = salao.whatsapp ? `https://wa.me/55${salao.whatsapp.replace(/\D/g, "")}` : null;
  const localizacao = [salao.endereco, salao.cidade && salao.estado ? `${salao.cidade}/${salao.estado}` : salao.cidade]
    .filter(Boolean)
    .join(" — ");

  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-bg/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 font-medium" style={{ fontFamily: "var(--font-display)" }}>
            {salao.urlLogo ? (
              <img src={salao.urlLogo} alt={nomeSalao} className="h-7 w-7 rounded-lg object-cover" />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-ink">
                <Scissors className="h-3.5 w-3.5 text-white" />
              </div>
            )}
            <span className="text-lg tracking-wide">{nomeSalao}</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-muted">
            <a href="#servicos" className="transition duration-200 hover:text-ink">
              Serviços
            </a>
            <a href="#contato" className="transition duration-200 hover:text-ink">
              Contato
            </a>
            <AlternadorTema />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6">
        <section className="relative grid items-center gap-12 py-20 md:grid-cols-[1.05fr_0.95fr] md:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-32 -top-10 h-80 w-80 rounded-full bg-accent/15 blur-3xl"
          />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-ink">{copy.eyebrow}</p>
            <h1
              className="mt-5 text-balance text-5xl font-medium leading-[1.08] sm:text-6xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {copy.heroHeadline}
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">{copy.heroSubheadline}</p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link to={caminho("/agendar")}>
                <Botao className="shadow-soft hover:shadow-glow">
                  Agendar horário
                  <ArrowRight className="h-4 w-4" />
                </Botao>
              </Link>
              <a href="#servicos" className="text-sm font-medium text-muted underline-offset-4 transition-colors hover:text-ink hover:underline">
                Ver serviços
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-[2rem] border border-line shadow-soft">
              {salao.urlBanner ? (
                <img
                  src={salao.urlBanner}
                  alt={nomeSalao}
                  className="h-[26rem] w-full object-cover md:h-[32rem]"
                />
              ) : (
                <div className="flex h-[26rem] w-full items-center justify-center bg-gradient-to-br from-accent/25 via-surface to-accent-ink/20 md:h-[32rem]">
                  <Icone className="h-16 w-16 text-accent-ink/70" />
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="servicos" className="border-t border-line py-16">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-medium" style={{ fontFamily: "var(--font-display)" }}>
                Serviços
              </h2>
              <p className="mt-2 text-sm text-muted">Preços a partir de.</p>
            </div>
          </div>

          {erroCarregamento && (
            <p className="mt-6 text-sm text-muted">Não foi possível carregar os serviços agora. Tente novamente em instantes.</p>
          )}

          {!erroCarregamento && servicos.length === 0 && (
            <p className="mt-6 text-sm text-muted">Nenhum serviço disponível no momento.</p>
          )}

          <ul className="mt-8 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {servicos.map((servico) => (
              <li
                key={servico.id}
                className="flex items-center justify-between gap-6 px-6 py-5 transition duration-200 hover:bg-hover"
              >
                <div>
                  <div className="font-medium">{servico.nome}</div>
                  {servico.descricao && <div className="mt-0.5 text-sm text-muted">{servico.descricao}</div>}
                </div>
                <div className="flex shrink-0 items-center gap-5">
                  <span className="whitespace-nowrap font-medium tabular-nums text-accent-ink">
                    {formatarDinheiro(servico.precoCentavos)}
                  </span>
                  <Link
                    to={caminho("/agendar")}
                    className="rounded-xl border border-line px-3.5 py-1.5 text-xs font-medium transition duration-200 hover:-translate-y-0.5 hover:bg-hover"
                  >
                    Agendar
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {(localizacao || linkWhatsapp) && (
          <section id="contato" className="border-t border-line py-16">
            <h2 className="text-3xl font-medium" style={{ fontFamily: "var(--font-display)" }}>
              Contato
            </h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {localizacao && (
                <li className="flex items-start gap-3 rounded-2xl border border-line bg-surface px-5 py-4 text-sm text-muted">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {localizacao}
                </li>
              )}
              {linkWhatsapp && (
                <a
                  href={linkWhatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-3 rounded-2xl border border-line bg-surface px-5 py-4 text-sm text-muted transition duration-200 hover:border-accent/40 hover:text-ink"
                >
                  <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  Falar no WhatsApp
                </a>
              )}
            </ul>
          </section>
        )}
      </main>

      <footer className="border-t border-line py-10 text-center text-sm text-muted">
        © {new Date().getFullYear()} {nomeSalao} — Todos os direitos reservados.
      </footer>
    </div>
  );
}
