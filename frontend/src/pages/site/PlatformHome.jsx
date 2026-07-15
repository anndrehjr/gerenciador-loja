import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Scissors,
  ArrowRight,
  ShieldCheck,
  Palette,
  CalendarCheck,
  Users,
  Smartphone,
  Building2,
  Mail,
  Menu,
  X,
  Check,
  Plus,
  UserPlus,
  Wand2,
  Share2,
  Minus,
  MessageCircle,
} from "lucide-react";
import ThemeToggle from "../../components/ThemeToggle.jsx";
import Button from "../../components/ui/Button.jsx";

const FEATURES = [
  {
    icon: Building2,
    title: "Site próprio pro seu salão",
    text: "Cada cliente ganha um site público com agendamento online, pronto em minutos e sem precisar configurar nada.",
  },
  {
    icon: Palette,
    title: "Identidade visual personalizada",
    text: "Escolha um modelo pronto ou defina sua própria cor e logo. O site e o painel seguem a marca do seu salão.",
  },
  {
    icon: ShieldCheck,
    title: "Seus dados, só seus",
    text: "Cada salão fica isolado dos demais — clientes, agenda e histórico nunca são compartilhados entre contas.",
  },
  {
    icon: CalendarCheck,
    title: "Agenda sem dor de cabeça",
    text: "Horários por profissional, turnos divididos, férias e folgas — tudo considerado na hora de liberar horários.",
  },
  {
    icon: Users,
    title: "Clientes e profissionais organizados",
    text: "Cadastro de clientes, equipe e serviços num painel simples, feito pra quem administra o salão no dia a dia.",
  },
  {
    icon: Smartphone,
    title: "Funciona em qualquer aparelho",
    text: "Painel administrativo e site de agendamento pensados pra funcionar bem tanto no computador quanto no celular.",
  },
];

const STEPS = [
  {
    icon: UserPlus,
    title: "Crie sua conta",
    text: "Cadastro guiado em poucos minutos: dados do salão, plano e tipo de negócio.",
  },
  {
    icon: Wand2,
    title: "Personalize",
    text: "Escolha cor, logo, serviços e equipe. O site já nasce com a cara do seu salão.",
  },
  {
    icon: Share2,
    title: "Compartilhe o link",
    text: "Seus clientes agendam sozinhos, direto pelo site — sem grupo de WhatsApp lotado.",
  },
];

const PLANS = [
  {
    name: "Start",
    tagline: "Pra começar a receber agendamentos online.",
    features: ["Landing page padrão", "Painel administrativo completo", "Agendamento online", "Suporte por email"],
  },
  {
    name: "Pro",
    tagline: "Landing exclusiva pro seu segmento.",
    features: [
      "Tudo do Start",
      "Landing exclusiva do seu tipo de negócio",
      "Vitrine de serviços em carrossel",
      "Suporte prioritário",
    ],
    highlight: true,
  },
  {
    name: "Premium",
    tagline: "Personalização completa, sem mexer em código.",
    features: [
      "Tudo do Pro",
      "Editar cada seção da landing pelo painel",
      "Cores, textos e ordem das seções livres",
      "Suporte dedicado",
    ],
  },
];

const COMPARE_ROWS = [
  { label: "Site de agendamento", start: true, pro: true, premium: true },
  { label: "Painel administrativo completo", start: true, pro: true, premium: true },
  { label: "Landing exclusiva por segmento", start: false, pro: true, premium: true },
  { label: "Vitrine de serviços em carrossel", start: false, pro: true, premium: true },
  { label: "Editar textos e cores pelo painel", start: false, pro: false, premium: true },
  { label: "Ordem das seções livre", start: false, pro: false, premium: true },
];

const FAQ = [
  {
    q: "Meus dados ficam isolados dos outros salões?",
    a: "Sim. Cada salão é uma conta separada — clientes, agenda, serviços e equipe nunca são compartilhados entre contas diferentes.",
  },
  {
    q: "Preciso saber programar pra personalizar meu site?",
    a: "Não. Você escolhe um modelo visual pronto e ajusta cor, logo e textos direto pelo painel, sem mexer em código.",
  },
  {
    q: "Meus clientes conseguem agendar sozinhos?",
    a: "Sim. Seu site tem uma página de agendamento online onde o cliente escolhe serviço, profissional, data e horário.",
  },
  {
    q: "Funciona pra barbearia e clínica de estética também?",
    a: "Sim. Além de salão, a plataforma tem landings próprias pra barbearia, unissex, clínica de estética e outros segmentos.",
  },
  {
    q: "Como funciona o suporte?",
    a: "Fale com a gente pelo contato abaixo — respondemos por email e ajudamos na configuração inicial do seu salão.",
  },
];

const NAV_LINKS = [
  { href: "#recursos", label: "Recursos" },
  { href: "#planos", label: "Planos" },
  { href: "#faq", label: "FAQ" },
  { href: "#contato", label: "Contato" },
];

// Revela o conteúdo com um leve fade+slide quando entra na tela — só uma vez,
// e sem efeito nenhum pra quem pediu menos movimento no sistema.
function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
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
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      } ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

function CompareMark({ value }) {
  if (value === true) return <Check className="mx-auto h-4 w-4 text-accent-ink" />;
  if (value === false) return <Minus className="mx-auto h-3.5 w-3.5 text-muted/50" />;
  return <span className="text-xs text-muted">{value}</span>;
}

export default function PlatformHome() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 font-semibold">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-ink">
              <Scissors className="h-3.5 w-3.5 text-white" />
            </div>
            Plataforma Style
          </div>
          <nav className="hidden items-center gap-6 text-sm text-muted sm:flex">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="transition duration-200 hover:text-ink">
                {link.label}
              </a>
            ))}
            <ThemeToggle />
            <a href="#contato">
              <Button className="px-3.5 py-2 text-xs">Solicitar demonstração</Button>
            </a>
          </nav>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink sm:hidden"
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {mobileOpen && (
          <nav className="flex flex-col gap-1 border-t border-line px-6 py-4 text-sm sm:hidden">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-2 py-2.5 text-muted transition duration-200 hover:bg-hover hover:text-ink"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex items-center justify-between px-2">
              <ThemeToggle />
              <a href="#contato" onClick={() => setMobileOpen(false)}>
                <Button className="px-3.5 py-2 text-xs">Solicitar demonstração</Button>
              </a>
            </div>
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-5xl px-6">
        <section className="relative overflow-hidden py-20 sm:py-28">
          <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-gradient-to-br from-accent/20 to-accent-ink/10 blur-3xl" />
          <div className="relative mx-auto max-w-2xl">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60 motion-reduce:animate-none" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                </span>
                Novo — agendamento online sem código
              </span>
              <h1
                className="mt-5 text-balance text-4xl font-semibold leading-[1.1] sm:text-5xl lg:text-6xl"
                style={{ fontFamily: "'Instrument Serif', 'Cormorant Garamond', serif" }}
              >
                O sistema completo pro seu{" "}
                <span className="bg-gradient-to-br from-accent to-accent-ink bg-clip-text italic text-transparent">
                  salão
                </span>
                , barbearia ou clínica de estética.
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-lg text-muted">
                Site próprio, agendamento online, painel administrativo e identidade visual personalizada — tudo em
                um só lugar, sem precisar mexer em código.
              </p>
              <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a href="#contato">
                  <Button>
                    Solicitar demonstração
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </a>
                <a href="#planos">
                  <Button variant="ghost">Ver planos</Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        <Reveal>
          <section id="recursos" className="border-t border-line py-16">
            <h2 className="text-xl font-semibold">Recursos</h2>
            <p className="mt-1 text-sm text-muted">O que está incluído.</p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, text }, i) => (
                <Reveal key={title} delay={i * 60}>
                  <div className="group h-full rounded-2xl border border-line bg-surface p-5 transition duration-200 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-soft">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent-ink/10">
                      <Icon className="h-4.5 w-4.5 text-accent-ink" />
                    </div>
                    <h3 className="mt-3 font-medium">{title}</h3>
                    <p className="mt-1.5 text-sm text-muted">{text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="border-t border-line py-16">
            <h2 className="text-xl font-semibold">Como funciona</h2>
            <p className="mt-1 text-sm text-muted">Do cadastro ao primeiro agendamento, em três passos.</p>
            <div className="relative mt-10 grid gap-8 sm:grid-cols-3">
              <div className="pointer-events-none absolute left-0 right-0 top-6 hidden border-t border-dashed border-line sm:block" />
              {STEPS.map(({ icon: Icon, title, text }, i) => (
                <div key={title} className="relative flex flex-col items-center text-center sm:items-start sm:text-left">
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-line bg-bg text-sm font-semibold text-accent-ink">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-medium">
                    {i + 1}. {title}
                  </h3>
                  <p className="mt-1.5 max-w-[26ch] text-sm text-muted">{text}</p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section id="planos" className="border-t border-line py-16">
            <h2 className="text-xl font-semibold">Planos</h2>
            <p className="mt-1 text-sm text-muted">
              Valores sob consulta — fale com a gente pra encontrar o plano certo pro seu salão.
            </p>
            <div className="mt-8 grid gap-5 sm:grid-cols-3">
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className={`flex flex-col rounded-2xl border p-6 ${
                    plan.highlight ? "border-accent shadow-glow" : "border-line"
                  } bg-surface`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{plan.name}</h3>
                    {plan.highlight && (
                      <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-ink">
                        Mais escolhido
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted">{plan.tagline}</p>
                  <ul className="mt-4 flex-1 space-y-2 text-sm">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-ink" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a href="#contato" className="mt-6">
                    <Button variant={plan.highlight ? "primary" : "ghost"} className="w-full">
                      Falar com vendas
                    </Button>
                  </a>
                </div>
              ))}
            </div>

            <div className="mt-10 overflow-x-auto rounded-2xl border border-line">
              <table className="w-full min-w-[520px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-line bg-surface text-left text-xs uppercase tracking-wide text-muted">
                    <th className="px-5 py-3 font-medium">Recurso</th>
                    <th className="px-5 py-3 text-center font-medium">Start</th>
                    <th className="px-5 py-3 text-center font-medium">Pro</th>
                    <th className="px-5 py-3 text-center font-medium">Premium</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_ROWS.map((row, i) => (
                    <tr key={row.label} className={i % 2 ? "bg-surface" : "bg-bg"}>
                      <td className="px-5 py-3">{row.label}</td>
                      <td className="px-5 py-3 text-center">
                        <CompareMark value={row.start} />
                      </td>
                      <td className="px-5 py-3 text-center">
                        <CompareMark value={row.pro} />
                      </td>
                      <td className="px-5 py-3 text-center">
                        <CompareMark value={row.premium} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="border-t border-line py-16">
            <h2 className="text-xl font-semibold">Depoimentos</h2>
            <div className="mt-6 rounded-2xl border border-dashed border-line bg-surface/60 p-8 text-center">
              <p className="text-sm text-muted">
                Em breve, depoimentos reais de quem já usa a plataforma no dia a dia do salão.
              </p>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section id="faq" className="border-t border-line py-16">
            <h2 className="text-xl font-semibold">Perguntas frequentes</h2>
            <p className="mt-1 text-sm text-muted">Tudo que você precisa saber antes de começar.</p>
            <div className="mt-6 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
              {FAQ.map(({ q, a }) => (
                <details key={q} className="group px-5 py-4 open:pb-4 [&::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium marker:content-none">
                    {q}
                    <Plus className="h-4 w-4 shrink-0 text-muted transition duration-200 group-open:rotate-45" />
                  </summary>
                  <p className="mt-2 text-sm text-muted">{a}</p>
                </details>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="border-t border-line py-16">
            <div className="relative overflow-hidden rounded-3xl border border-line bg-surface p-8 sm:p-12">
              <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-accent/20 to-accent-ink/10 blur-3xl" />
              <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                <div>
                  <h2
                    className="text-2xl font-semibold sm:text-3xl"
                    style={{ fontFamily: "'Instrument Serif', 'Cormorant Garamond', serif" }}
                  >
                    Pronto pra profissionalizar seu salão?
                  </h2>
                  <p className="mt-2 max-w-md text-sm text-muted">
                    Solicite uma demonstração e veja a plataforma funcionando com a identidade do seu negócio.
                  </p>
                </div>
                <a href="#contato" className="shrink-0">
                  <Button>
                    Solicitar demonstração
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            </div>
          </section>
        </Reveal>

        <section id="contato" className="border-t border-line py-16">
          <h2 className="text-xl font-semibold">Contato</h2>
          <p className="mt-4 max-w-lg text-sm text-muted">
            Quer conhecer a plataforma ou contratar pro seu salão? Fale com a gente.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <a
              href="mailto:anndreh01@gmail.com"
              className="inline-flex items-center gap-2 text-sm text-accent-ink hover:underline"
            >
              <Mail className="h-4 w-4" />
              anndreh01@gmail.com
            </a>
            <a
              href="https://wa.me/5518996791377"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-accent-ink hover:underline"
            >
              <MessageCircle className="h-4 w-4" />
              (18) 99679-1377
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <div className="grid gap-10 sm:grid-cols-[1.3fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-2 font-semibold">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-ink">
                  <Scissors className="h-3.5 w-3.5 text-white" />
                </div>
                Plataforma Style
              </div>
              <p className="mt-3 max-w-xs text-sm text-muted">
                Site, agendamento online e painel administrativo pra salões, barbearias e clínicas de estética.
              </p>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted">Produto</div>
              <ul className="mt-3 space-y-2 text-sm">
                <li><a href="#recursos" className="text-muted transition duration-200 hover:text-ink">Recursos</a></li>
                <li><a href="#planos" className="text-muted transition duration-200 hover:text-ink">Planos</a></li>
                <li><a href="#faq" className="text-muted transition duration-200 hover:text-ink">FAQ</a></li>
              </ul>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted">Contato</div>
              <ul className="mt-3 space-y-2 text-sm">
                <li><a href="#contato" className="text-muted transition duration-200 hover:text-ink">Fale com a gente</a></li>
                <li><Link to="/login" className="text-muted transition duration-200 hover:text-ink">Área da equipe</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-line pt-6 text-xs text-muted">
            © {new Date().getFullYear()} Plataforma Style. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
