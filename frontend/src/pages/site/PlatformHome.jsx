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

const PLANS = [
  {
    name: "Starter",
    tagline: "Pra começar a receber agendamentos online.",
    features: ["Site de agendamento", "1 salão", "Painel administrativo", "Suporte por email"],
  },
  {
    name: "Pro",
    tagline: "Pra salões com equipe e agenda cheia.",
    features: ["Tudo do Starter", "Vários profissionais", "Identidade visual personalizada", "Suporte prioritário"],
    highlight: true,
  },
  {
    name: "Business",
    tagline: "Pra redes com mais de uma unidade.",
    features: ["Tudo do Pro", "Múltiplos salões", "Onboarding assistido", "Suporte dedicado"],
  },
];

const FAQ = [
  {
    q: "Meus dados ficam isolados dos outros salões?",
    a: "Sim. Cada salão é uma conta separada — clientes, agenda, serviços e equipe nunca são compartilhados entre contas diferentes.",
  },
  {
    q: "Preciso saber programar pra personalizar meu site?",
    a: "Não. Você escolhe um modelo visual pronto e ajusta cor e logo direto pelo painel, sem mexer em código.",
  },
  {
    q: "Meus clientes conseguem agendar sozinhos?",
    a: "Sim. Seu site tem uma página de agendamento online onde o cliente escolhe serviço, profissional, data e horário.",
  },
  {
    q: "Como funciona o suporte?",
    a: "Fale com a gente pelo contato abaixo — respondemos por email e ajudamos na configuração inicial do seu salão.",
  },
];

function NavLink({ href, children }) {
  return (
    <a href={href} className="transition duration-200 hover:text-ink">
      {children}
    </a>
  );
}

export default function PlatformHome() {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2 font-semibold">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-ink">
              <Scissors className="h-3.5 w-3.5 text-white" />
            </div>
            Plataforma pra Salões
          </div>
          <nav className="hidden items-center gap-6 text-sm text-muted sm:flex">
            <NavLink href="#recursos">Recursos</NavLink>
            <NavLink href="#planos">Planos</NavLink>
            <NavLink href="#faq">FAQ</NavLink>
            <NavLink href="#contato">Contato</NavLink>
            <ThemeToggle />
          </nav>
          <a href="#contato" className="sm:hidden">
            <Button className="px-3 py-1.5 text-xs">Contato</Button>
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6">
        <section className="relative overflow-hidden py-24 text-center sm:text-left">
          <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-gradient-to-br from-accent/15 to-accent-ink/10 blur-3xl" />
          <h1 className="relative text-balance text-4xl font-semibold leading-tight sm:text-5xl">
            O sistema completo pro seu salão, barbearia ou clínica de estética.
          </h1>
          <p className="relative mx-auto mt-4 max-w-xl text-lg text-muted sm:mx-0">
            Site próprio, agendamento online, painel administrativo e identidade visual personalizada — tudo em um só
            lugar, sem precisar mexer em código.
          </p>
          <div className="relative mt-8 flex flex-col items-center gap-3 sm:flex-row sm:items-start">
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
        </section>

        <section id="recursos" className="border-t border-line py-16">
          <h2 className="text-xl font-semibold">Recursos</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-line bg-surface p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent-ink/10">
                  <Icon className="h-4.5 w-4.5 text-accent-ink" />
                </div>
                <h3 className="mt-3 font-medium">{title}</h3>
                <p className="mt-1.5 text-sm text-muted">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="planos" className="border-t border-line py-16">
          <h2 className="text-xl font-semibold">Planos</h2>
          <p className="mt-1 text-sm text-muted">Valores sob consulta — fale com a gente pra encontrar o plano certo pro seu salão.</p>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`flex flex-col rounded-2xl border p-6 ${
                  plan.highlight ? "border-accent ring-1 ring-accent" : "border-line"
                } bg-surface`}
              >
                <h3 className="font-semibold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted">{plan.tagline}</p>
                <ul className="mt-4 flex-1 space-y-2 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent-ink" />
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
        </section>

        <section className="border-t border-line py-16">
          <h2 className="text-xl font-semibold">Depoimentos</h2>
          <p className="mt-4 max-w-lg text-sm text-muted">
            Em breve, depoimentos reais de quem já usa a plataforma no dia a dia do salão.
          </p>
        </section>

        <section id="faq" className="border-t border-line py-16">
          <h2 className="text-xl font-semibold">Perguntas frequentes</h2>
          <div className="mt-6 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="px-5 py-4">
                <div className="font-medium">{q}</div>
                <div className="mt-1 text-sm text-muted">{a}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="contato" className="border-t border-line py-16">
          <h2 className="text-xl font-semibold">Contato</h2>
          <p className="mt-4 max-w-lg text-sm text-muted">
            Quer conhecer a plataforma ou contratar pro seu salão? Fale com a gente.
          </p>
          <a
            href="mailto:contato@andre-aguiar-jr.com.br"
            className="mt-6 inline-flex items-center gap-2 text-sm text-accent-ink hover:underline"
          >
            <Mail className="h-4 w-4" />
            contato@andre-aguiar-jr.com.br
          </a>
        </section>
      </main>

      <footer className="border-t border-line py-8 text-center text-xs text-muted">
        © {new Date().getFullYear()} Plataforma pra Salões ·{" "}
        <Link to="/login" className="hover:underline">
          Área da equipe
        </Link>
      </footer>
    </div>
  );
}
