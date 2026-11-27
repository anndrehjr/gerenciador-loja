import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Scissors,
  Menu,
  X,
  ArrowRight,
  ArrowUp,
  Check,
  Minus,
  Plus,
  Loader2,
  Mail,
  MessageCircle,
  CalendarCheck,
  Users,
  UserCog,
  Wallet,
  BarChart3,
  UserPlus,
  CalendarPlus,
  Rocket,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  LayoutDashboard,
  CalendarClock,
  Settings,
} from "lucide-react";
import AlternadorTema from "../../componentes/AlternadorTema.jsx";
import Botao from "../../componentes/ui/Botao.jsx";
import { PLANOS, INFO_PLANO } from "../../biblioteca/planos.js";

const LINK_WHATSAPP = "https://wa.me/5518996791377";
const EMAIL_CONTATO = "contato@plataformastyle.com";

const LINKS_NAV = [
  { href: "#recursos", rotulo: "Recursos" },
  { href: "#planos", rotulo: "Planos" },
  { href: "#faq", rotulo: "FAQ" },
  { href: "#contato", rotulo: "Contato" },
];

const RECURSOS = [
  {
    icone: CalendarCheck,
    titulo: "Agenda Inteligente",
    texto: "Organize horários, profissionais e serviços sem conflitos.",
  },
  {
    icone: Users,
    titulo: "Gestão de Clientes",
    texto: "Tenha histórico completo dos clientes e preferências.",
  },
  {
    icone: UserCog,
    titulo: "Controle de Profissionais",
    texto: "Gerencie equipe, horários e produtividade.",
  },
  {
    icone: MessageCircle,
    titulo: "WhatsApp Automático",
    texto: "Envie lembretes e reduza faltas.",
  },
  {
    icone: Wallet,
    titulo: "Controle Financeiro",
    texto: "Acompanhe pagamentos, vendas e resultados.",
  },
  {
    icone: BarChart3,
    titulo: "Relatórios",
    texto: "Veja dados para tomar melhores decisões.",
  },
];

const ETAPAS = [
  {
    numero: "01",
    icone: UserPlus,
    titulo: "Crie sua conta",
    texto: "Cadastre seu negócio rapidamente.",
  },
  {
    numero: "02",
    icone: CalendarPlus,
    titulo: "Configure sua agenda",
    texto: "Adicione serviços, profissionais e horários.",
  },
  {
    numero: "03",
    icone: Rocket,
    titulo: "Comece a atender",
    texto: "Receba clientes e acompanhe resultados.",
  },
];

// Só fatos do produto (nada de números de mercado): teste grátis, planos e agendamento sem login.
const ESTATISTICAS = [
  { valor: "14 dias", rotulo: "de teste grátis" },
  { valor: "3 planos", rotulo: "START, PRO e PREMIUM" },
  { valor: "Sem login", rotulo: "para o cliente agendar" },
];

const LINHAS_COMPARACAO = [
  { rotulo: "Agenda inteligente", START: true, PRO: true, PREMIUM: true },
  { rotulo: "Gestão de clientes", START: true, PRO: true, PREMIUM: true },
  { rotulo: "Controle de profissionais", START: true, PRO: true, PREMIUM: true },
  { rotulo: "WhatsApp automático", START: false, PRO: true, PREMIUM: true },
  { rotulo: "Relatórios", START: "Básico", PRO: "Avançado", PREMIUM: "Avançado" },
  { rotulo: "Controle financeiro", START: false, PRO: true, PREMIUM: true },
  { rotulo: "Aplicativo mobile", START: true, PRO: true, PREMIUM: true },
];

const PERGUNTAS = [
  {
    pergunta: "O que é a Plataforma Style?",
    resposta:
      "É um sistema completo de agendamento e gestão para salões, barbearias, clínicas de estética e negócios de beleza — cada cliente ganha um site próprio para agendamento online e um painel administrativo completo.",
  },
  {
    pergunta: "Preciso instalar algum programa?",
    resposta:
      "Não. Tudo funciona direto no navegador, no computador ou no celular, sem instalar nada. Também existe uma versão para Android.",
  },
  {
    pergunta: "Posso cadastrar vários profissionais?",
    resposta:
      "Sim, sem limite. Cada profissional tem seus próprios horários de trabalho, folgas e serviços vinculados, considerados automaticamente na hora de liberar a agenda.",
  },
  {
    pergunta: "Existe aplicativo?",
    resposta:
      "Sim. Além de funcionar como site em qualquer aparelho, a plataforma tem uma versão empacotada para Android.",
  },
  {
    pergunta: "Como funciona o teste?",
    resposta:
      "Clique em \"Começar grátis\", crie sua conta em menos de 2 minutos e use a plataforma por 14 dias sem compromisso. Se preferir, também pode pedir uma demonstração com a equipe.",
  },
];

const ITENS_AGENDA_MOCKUP = [
  { hora: "09:00", cliente: "Marina Alves", servico: "Corte + escova", status: "Confirmado" },
  { hora: "10:30", cliente: "João Pedro", servico: "Barba", status: "Agendado" },
  { hora: "13:00", cliente: "Camila Souza", servico: "Coloração", status: "Confirmado" },
  { hora: "15:30", cliente: "Rafael Lima", servico: "Corte", status: "Agendado" },
];

const NAV_MOCKUP = [
  { icone: LayoutDashboard, rotulo: "Painel", ativo: true },
  { icone: Users, rotulo: "Clientes" },
  { icone: Scissors, rotulo: "Serviços" },
  { icone: CalendarClock, rotulo: "Agenda" },
  { icone: Settings, rotulo: "Config." },
];

// Revela o conteúdo com fade+slide quando entra na tela — só uma vez, e sem
// efeito nenhum pra quem pediu menos movimento no sistema.
function Revelar({ children, atraso = 0, className = "" }) {
  const ref = useRef(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisivel(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 ${
        visivel ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      } ${className}`}
      style={{ transitionDelay: visivel ? `${atraso}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

function MarcaComparacao({ valor }) {
  if (valor === true) return <Check className="mx-auto h-4 w-4 text-accent-ink" aria-label="Incluído" />;
  if (valor === false) return <Minus className="mx-auto h-3.5 w-3.5 text-muted/40" aria-label="Não incluído" />;
  return <span className="text-xs font-medium text-muted">{valor}</span>;
}

function Marca() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink text-bg">
        <Scissors className="h-4 w-4" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-[15px] font-semibold tracking-tight">Plataforma Style</span>
        <span className="hidden text-[11px] text-muted sm:block">Gestão inteligente para beleza</span>
      </span>
    </Link>
  );
}

// Mostra um spinner por um instante antes de navegar — dá feedback visual de
// que o clique foi registrado enquanto a tela de login carrega.
function LinkEntrar({ className, aoClicar }) {
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(false);

  function handleClick(e) {
    e.preventDefault();
    if (carregando) return;
    aoClicar?.();
    setCarregando(true);
    setTimeout(() => navigate("/login"), 350);
  }

  return (
    <a href="/login" onClick={handleClick} className={className} aria-busy={carregando}>
      {carregando ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
    </a>
  );
}

// Some enquanto a página está no topo; aparece depois de rolar um pouco.
function BotaoVoltarTopo() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    function aoRolar() {
      setVisivel(window.scrollY > 480);
    }
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Voltar ao topo"
      className={`fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-ink shadow-soft transition duration-300 hover:-translate-y-0.5 hover:bg-hover ${
        visivel ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <ArrowUp className="h-4.5 w-4.5" />
    </button>
  );
}

function CartaoFlutuante({ className, delay = "0s", children }) {
  return (
    <div
      className={`absolute hidden rounded-2xl border border-line bg-surface/95 p-4 shadow-soft backdrop-blur-sm sm:flex ${className}`}
      style={{ animation: `flutuar 6s ease-in-out ${delay} infinite` }}
    >
      {children}
    </div>
  );
}

// Mockup do painel construído só com JSX/Tailwind (sem imagens) — representa
// a agenda do dia, com dois cartões "vivos" flutuando ao redor pra reforçar,
// visualmente, os números de confirmação e faturamento do hero.
function MockupPainel() {
  return (
    <motion.div
      className="relative mx-auto mt-16 w-full max-w-4xl motion-reduce:transition-none"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.5 }}
    >
      <div className="pointer-events-none absolute inset-x-8 -bottom-6 top-10 -z-10 rounded-[32px] bg-gradient-to-b from-accent/15 to-transparent blur-3xl" />

      <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-soft">
        <div className="flex items-center gap-1.5 border-b border-line bg-hover/60 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          <span className="mx-auto rounded-full bg-bg px-3 py-1 text-[11px] text-muted">
            app.plataformastyle.com/painel
          </span>
        </div>

        <div className="grid grid-cols-[56px_1fr] sm:grid-cols-[168px_1fr]">
          <nav className="flex flex-col gap-1 border-r border-line p-3">
            {NAV_MOCKUP.map(({ icone: Icone, rotulo, ativo }) => (
              <div
                key={rotulo}
                className={`flex items-center justify-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium sm:justify-start ${
                  ativo ? "bg-gradient-to-r from-accent/15 to-accent-ink/10 text-accent-ink" : "text-muted"
                }`}
              >
                <Icone className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">{rotulo}</span>
              </div>
            ))}
          </nav>

          <div className="flex flex-col gap-4 p-4 sm:p-6">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-line p-3">
                <div className="text-[11px] text-muted">Clientes</div>
                <div className="mt-1 text-base font-semibold tabular-nums sm:text-lg">248</div>
              </div>
              <div className="rounded-xl border border-line p-3">
                <div className="text-[11px] text-muted">Hoje</div>
                <div className="mt-1 text-base font-semibold tabular-nums sm:text-lg">18</div>
              </div>
              <div className="rounded-xl border border-line p-3">
                <div className="text-[11px] text-muted">Faturamento</div>
                <div className="mt-1 text-base font-semibold tabular-nums sm:text-lg">R$ 12,4k</div>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-line">
              {ITENS_AGENDA_MOCKUP.map((item, i) => (
                <div
                  key={item.hora}
                  className={`flex items-center gap-3 px-3.5 py-2.5 text-xs sm:text-sm ${
                    i > 0 ? "border-t border-line" : ""
                  }`}
                >
                  <span className="w-10 shrink-0 font-medium tabular-nums text-muted">{item.hora}</span>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent/25 to-accent-ink/15 text-[10px] font-semibold text-accent-ink">
                    {item.cliente
                      .split(" ")
                      .slice(0, 2)
                      .map((p) => p[0])
                      .join("")}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    <span className="font-medium">{item.cliente}</span>
                    <span className="text-muted"> · {item.servico}</span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      item.status === "Confirmado" ? "bg-accent/10 text-accent-ink" : "bg-hover text-muted"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <CartaoFlutuante className="-right-6 -top-8 max-w-[220px] flex-col gap-1 rotate-3" delay="0s">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-accent-ink" />
          <span className="text-xs font-semibold">Agendamento confirmado</span>
        </div>
        <span className="text-[11px] text-muted">Marina Alves · 09:00</span>
      </CartaoFlutuante>

      <CartaoFlutuante className="-bottom-8 -left-6 max-w-[210px] flex-col gap-1 -rotate-3" delay="1.2s">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 shrink-0 text-accent-ink" />
          <span className="text-xs font-semibold">Faturamento do mês</span>
        </div>
        <span className="text-sm font-semibold tabular-nums">R$ 12.480</span>
        <span className="text-[11px] text-emerald-500">+18% vs. mês anterior</span>
      </CartaoFlutuante>

      <style>{`
        @keyframes flutuar {
          0%, 100% { transform: translateY(0) rotate(var(--rot, 0deg)); }
          50% { transform: translateY(-8px) rotate(var(--rot, 0deg)); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>
    </motion.div>
  );
}

export default function InicioPlataforma() {
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);

  // F5/recarregar deve sempre abrir do topo, não restaurar a posição anterior.
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-bg text-ink">
      {/* 1. Header */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-line/70 bg-bg/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Marca />
          <nav className="hidden items-center gap-8 text-sm text-muted sm:flex">
            {LINKS_NAV.map((link) => (
              <a key={link.href} href={link.href} className="group relative transition duration-200 hover:text-ink">
                {link.rotulo}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-ink transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
            <LinkEntrar className="transition duration-200 hover:text-ink" />
            <AlternadorTema />
            <Link to="/criar-conta">
              <Botao pilula className="px-4 py-2 text-xs">
                Começar grátis
              </Botao>
            </Link>
          </nav>
          <div className="flex items-center gap-1 sm:hidden">
            <AlternadorTema />
            <button
              onClick={() => setMenuMobileAberto((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-ink"
              aria-label={menuMobileAberto ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuMobileAberto}
            >
              {menuMobileAberto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {menuMobileAberto && (
          <nav className="flex flex-col gap-1 border-t border-line px-6 py-4 text-sm sm:hidden">
            {LINKS_NAV.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuMobileAberto(false)}
                className="rounded-lg px-2 py-2.5 text-muted transition duration-200 hover:bg-hover hover:text-ink"
              >
                {link.rotulo}
              </a>
            ))}
            <LinkEntrar
              aoClicar={() => setMenuMobileAberto(false)}
              className="rounded-lg px-2 py-2.5 text-muted transition duration-200 hover:bg-hover hover:text-ink"
            />
            <Link to="/criar-conta" onClick={() => setMenuMobileAberto(false)} className="mt-1">
              <Botao pilula className="w-full px-4 py-2 text-xs">
                Começar grátis
              </Botao>
            </Link>
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-5xl px-6">
        {/* 2. Hero full screen */}
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-2 pb-20 pt-32 text-center">
          <div
            className="pointer-events-none absolute inset-0 -z-10 opacity-40 [mask-image:radial-gradient(ellipse_55%_45%_at_50%_10%,black,transparent)]"
            style={{
              backgroundImage: "radial-gradient(circle, rgb(var(--line)) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-accent/20 to-accent-ink/10 blur-3xl" />

          <motion.span
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wider text-muted"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles className="h-3.5 w-3.5 text-accent-ink" />
            Feito para salões, barbearias e clínicas de estética
          </motion.span>

          <motion.h1
            className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-extrabold leading-[1.08] tracking-tighter sm:text-6xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Transforme seu salão em um{" "}
            <span className="bg-gradient-to-r from-accent to-accent-ink bg-clip-text text-transparent">
              negócio mais inteligente
            </span>
          </motion.h1>

          <motion.p
            className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Controle agendamentos, clientes, profissionais e vendas em uma única plataforma criada para negócios de
            beleza.
          </motion.p>

          <motion.div
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <a href={LINK_WHATSAPP} target="_blank" rel="noreferrer">
              <Botao pilula aria-label="Solicitar demonstração pelo WhatsApp">
                Solicitar demonstração
                <ArrowRight className="h-4 w-4" />
              </Botao>
            </a>
            <a href="#recursos">
              <Botao variante="ghost" pilula>
                Conhecer recursos
              </Botao>
            </a>
          </motion.div>

          <motion.div
            className="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {ESTATISTICAS.map((stat, i) => (
              <div key={stat.rotulo} className="flex items-center gap-x-10">
                {i > 0 && <span className="hidden h-8 w-px bg-line sm:block" aria-hidden="true" />}
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold tabular-nums sm:text-3xl">{stat.valor}</span>
                  <span className="text-xs text-muted">{stat.rotulo}</span>
                </div>
              </div>
            ))}
          </motion.div>

          <MockupPainel />
        </section>

        {/* 3. Recursos */}
        <Revelar>
          <section id="recursos" className="scroll-mt-24 border-t border-line py-24">
            <h2 className="font-display text-4xl font-normal tracking-tight">Recursos</h2>
            <p className="mt-2 text-sm text-muted">Tudo que o seu salão precisa, num só lugar.</p>
            <div className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {RECURSOS.map(({ icone: Icone, titulo, texto }, i) => (
                <Revelar key={titulo} atraso={i * 60}>
                  <div className="group flex h-full flex-col rounded-2xl border border-transparent p-1 transition duration-300 hover:-translate-y-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-hover text-accent-ink transition duration-300 group-hover:bg-accent/15">
                      <Icone className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-[15px] font-medium">{titulo}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{texto}</p>
                  </div>
                </Revelar>
              ))}
            </div>
          </section>
        </Revelar>

        {/* 4. Como funciona */}
        <Revelar>
          <section className="border-t border-line py-24">
            <h2 className="font-display text-4xl font-normal tracking-tight">Comece em poucos minutos</h2>
            <p className="mt-2 text-sm text-muted">Do cadastro ao primeiro agendamento, em três passos.</p>
            <div className="mt-12 grid gap-12 sm:grid-cols-3">
              {ETAPAS.map(({ numero, icone: Icone, titulo, texto }) => (
                <div key={numero} className="relative flex flex-col items-start text-left">
                  <span className="pointer-events-none absolute -top-4 right-0 text-6xl font-extrabold text-ink/[0.05] sm:text-7xl">
                    {numero}
                  </span>
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-accent-ink">
                    <Icone className="h-5 w-5" />
                  </div>
                  <h3 className="relative mt-5 text-[15px] font-medium">{titulo}</h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-muted">{texto}</p>
                </div>
              ))}
            </div>
          </section>
        </Revelar>

        {/* 5. Planos + 6. Tabela comparativa */}
        <Revelar>
          <section id="planos" className="scroll-mt-24 border-t border-line py-24">
            <h2 className="font-display text-4xl font-normal tracking-tight">Planos</h2>
            <p className="mt-2 max-w-md text-sm text-muted">
              Valores sob consulta — fale com a gente pra encontrar o plano certo pro seu salão.
            </p>
            <div className="mt-12 grid gap-5 sm:grid-cols-3">
              {PLANOS.map((chave) => {
                const info = INFO_PLANO[chave];
                return (
                  <div
                    key={chave}
                    className={`flex flex-col rounded-2xl border p-6 transition duration-200 ${
                      info.destaque ? "border-ink bg-surface shadow-soft sm:-translate-y-2" : "border-line"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{info.rotulo}</h3>
                      {info.destaque && (
                        <span className="rounded-full bg-ink px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-bg">
                          Mais escolhido
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">{info.slogan}</p>

                    <div className="mt-5 border-t border-line pt-5">
                      <span className="text-lg font-semibold">Sob consulta</span>
                      <p className="mt-0.5 text-xs text-muted">Valor personalizado para o seu negócio</p>
                    </div>

                    <ul className="mt-6 flex-1 space-y-3 text-sm">
                      {info.recursos.map((r) => (
                        <li key={r} className="flex items-start gap-2.5">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-ink" />
                          {r}
                        </li>
                      ))}
                    </ul>
                    {chave === "START" ? (
                      <Link to="/criar-conta" className="mt-7">
                        <Botao variante="ghost" pilula className="w-full">
                          Começar grátis
                        </Botao>
                      </Link>
                    ) : (
                      <a href="#contato" className="mt-7">
                        <Botao variante={info.destaque ? "primary" : "ghost"} pilula className="w-full">
                          Falar com vendas
                        </Botao>
                      </a>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-10 overflow-x-auto rounded-2xl border border-line">
              <table className="w-full min-w-[560px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                    <th className="px-5 py-3.5 font-medium">Recurso</th>
                    {PLANOS.map((chave) => (
                      <th key={chave} className="px-5 py-3.5 text-center font-medium">
                        {INFO_PLANO[chave].rotulo}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {LINHAS_COMPARACAO.map((linha) => (
                    <tr key={linha.rotulo} className="border-b border-line last:border-0">
                      <td className="px-5 py-3.5">{linha.rotulo}</td>
                      {PLANOS.map((chave) => (
                        <td key={chave} className="px-5 py-3.5 text-center">
                          <MarcaComparacao valor={linha[chave]} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </Revelar>

        {/* 7. FAQ */}
        <Revelar>
          <section id="faq" className="scroll-mt-24 border-t border-line py-24">
            <h2 className="font-display text-4xl font-normal tracking-tight">Perguntas frequentes</h2>
            <p className="mt-2 text-sm text-muted">Tudo que você precisa saber antes de começar.</p>
            <div className="mt-10 divide-y divide-line border-t border-line">
              {PERGUNTAS.map(({ pergunta, resposta }) => (
                <details key={pergunta} className="group py-5 [&::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium marker:content-none">
                    {pergunta}
                    <Plus className="h-4 w-4 shrink-0 text-muted transition duration-200 group-open:rotate-45" />
                  </summary>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{resposta}</p>
                </details>
              ))}
            </div>
          </section>
        </Revelar>

        {/* 8. CTA final */}
        <Revelar>
          <section className="border-t border-line py-24">
            <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-line bg-surface p-8 sm:flex-row sm:items-center sm:p-12">
              <div>
                <h2 className="font-display text-4xl font-normal tracking-tight">Pronto para transformar seu negócio?</h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
                  Tenha uma gestão profissional e entregue uma experiência melhor para seus clientes.
                </p>
              </div>
              <a href={LINK_WHATSAPP} target="_blank" rel="noreferrer" className="shrink-0">
                <Botao pilula>
                  Solicitar demonstração
                  <ArrowRight className="h-4 w-4" />
                </Botao>
              </a>
            </div>
          </section>
        </Revelar>

        {/* 9. Contato */}
        <section id="contato" className="scroll-mt-24 border-t border-line py-24">
          <h2 className="font-display text-4xl font-normal tracking-tight">Contato</h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
            Quer conhecer a plataforma ou contratar pro seu salão? Fale com a gente.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <a
              href={`mailto:${EMAIL_CONTATO}`}
              className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-soft"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-hover text-accent-ink">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-medium">E-mail</div>
                <div className="text-sm text-muted">{EMAIL_CONTATO}</div>
              </div>
            </a>
            <a
              href={LINK_WHATSAPP}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-soft"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#25D366]/15 text-[#25D366]">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-medium">WhatsApp</div>
                <div className="text-sm text-muted">Fale com nosso atendimento</div>
              </div>
            </a>
          </div>
        </section>
      </main>

      {/* 10. Footer */}
      <footer className="border-t border-line">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <Marca />
            <nav className="flex flex-wrap items-center gap-x-7 gap-y-2 text-sm text-muted">
              {LINKS_NAV.map((link) => (
                <a key={link.href} href={link.href} className="group relative transition duration-200 hover:text-ink">
                  {link.rotulo}
                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-ink transition-all duration-300 group-hover:w-full" />
                </a>
              ))}
            </nav>
          </div>
          <div className="mt-10 border-t border-line pt-6 text-xs text-muted">
            {"© "}
            {new Date().getFullYear()} Plataforma Style. Todos os direitos reservados.
          </div>
        </div>
      </footer>

      {/* 11. Voltar ao topo */}
      <BotaoVoltarTopo />
    </div>
  );
}
