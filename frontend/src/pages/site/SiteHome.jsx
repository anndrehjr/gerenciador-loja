import { useEffect, useState } from "react";
import { Scissors, MapPin, Phone, Clock } from "lucide-react";
import { api } from "../../lib/api.js";
import { formatMoney } from "../../lib/format.js";
import ThemeToggle from "../../components/ThemeToggle.jsx";

export default function SiteHome() {
  const [services, setServices] = useState([]);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    api
      .get("/public/services")
      .then(setServices)
      .catch(() => setLoadError(true));
  }, []);

  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2 font-semibold">
            <Scissors className="h-5 w-5 text-accent" />
            Salão
          </div>
          <nav className="flex items-center gap-6 text-sm text-muted">
            <a href="#servicos" className="hover:text-ink">
              Serviços
            </a>
            <a href="#contato" className="hover:text-ink">
              Contato
            </a>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6">
        <section className="py-20">
          <h1 className="text-balance text-4xl font-semibold leading-tight sm:text-5xl">
            Cuidado e estilo, com hora marcada.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted">
            Cortes, coloração e tratamentos capilares num ambiente pensado para você.
          </p>
        </section>

        <section id="servicos" className="border-t border-line py-16">
          <h2 className="text-xl font-semibold">Serviços</h2>

          {loadError && (
            <p className="mt-4 text-sm text-muted">
              Não foi possível carregar os serviços agora. Tente novamente em instantes.
            </p>
          )}

          {!loadError && services.length === 0 && (
            <p className="mt-4 text-sm text-muted">Nenhum serviço disponível no momento.</p>
          )}

          <ul className="mt-6 divide-y divide-line">
            {services.map((service) => (
              <li key={service.id} className="flex items-start justify-between gap-6 py-4">
                <div>
                  <div className="font-medium">{service.name}</div>
                  {service.description && (
                    <div className="mt-0.5 text-sm text-muted">{service.description}</div>
                  )}
                </div>
                <div className="whitespace-nowrap font-medium tabular-nums">
                  {formatMoney(service.priceCents)}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section id="contato" className="border-t border-line py-16">
          <h2 className="text-xl font-semibold">Contato</h2>
          <ul className="mt-6 space-y-3 text-sm text-muted">
            <li className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-accent" /> Rua Exemplo, 123 — Centro
            </li>
            <li className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-accent" /> (11) 90000-0000
            </li>
            <li className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-accent" /> Terça a sábado, 9h às 19h
            </li>
          </ul>
        </section>
      </main>

      <footer className="border-t border-line py-8 text-center text-xs text-muted">
        © {new Date().getFullYear()} Salão
      </footer>
    </div>
  );
}
