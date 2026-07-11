import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Clock, UserRound, CalendarPlus } from "lucide-react";
import { api } from "../../lib/api.js";
import { formatMoney } from "../../lib/format.js";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";

const STEP_LABELS = ["Telefone", "Serviço", "Profissional", "Data e hora", "Confirmação"];

function ProgressSteps({ current }) {
  return (
    <div className="mb-10 flex items-center">
      {STEP_LABELS.map((label, i) => (
        <div key={label} className="flex flex-1 items-center last:flex-none">
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium transition duration-200 ${
              i <= current
                ? "bg-gradient-to-br from-violet-500 to-accent-blue text-white"
                : "bg-hover text-muted"
            }`}
          >
            {i < current ? <Check className="h-4 w-4" /> : i + 1}
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div className={`mx-2 h-px flex-1 transition duration-200 ${i < current ? "bg-accent" : "bg-line"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function StepShell({ title, subtitle, children }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function PhoneStep({ onNext }) {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("idle");
  const [clientId, setClientId] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const digits = phone.replace(/\D/g, "");

  useEffect(() => {
    if (digits.length < 10) {
      setStatus("idle");
      return;
    }
    setStatus("checking");
    const timeout = setTimeout(() => {
      api
        .get(`/public/clients/lookup?phone=${encodeURIComponent(digits)}`)
        .then((data) => {
          if (data.found) {
            setClientId(data.clientId);
            setStatus("found");
          } else {
            setStatus("new");
          }
        })
        .catch(() => setStatus("idle"));
    }, 500);
    return () => clearTimeout(timeout);
  }, [digits]);

  // Telefone já cadastrado: não exibimos nome/e-mail/histórico de quem quer
  // que seja (quem está digitando ainda não provou ser o dono do número) —
  // só avançamos direto pra escolha do serviço.
  useEffect(() => {
    if (status !== "found" || !clientId) return;
    const timeout = setTimeout(() => {
      onNext({ client: { id: clientId }, phone: digits });
    }, 600);
    return () => clearTimeout(timeout);
  }, [status, clientId]);

  async function handleCreateClient(e) {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Informe seu nome.");
      return;
    }
    setSubmitting(true);
    try {
      const client = await api.post("/public/clients", {
        name,
        phone: digits,
        email: email || null,
      });
      onNext({ client: { id: client.id }, phone: digits });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <StepShell title="Agende seu horário" subtitle="Informe seu telefone para começar.">
      <Input
        id="phone"
        label="Telefone"
        type="tel"
        placeholder="(11) 98888-7777"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        autoFocus
      />

      {status === "checking" && <p className="text-sm text-muted">Verificando…</p>}

      {status === "found" && (
        <div className="flex items-center gap-2 rounded-2xl border border-line bg-surface p-5 text-sm text-muted shadow-soft">
          <Check className="h-4 w-4 text-accent-ink" />
          Telefone reconhecido — continuando…
        </div>
      )}

      {status === "new" && (
        <form
          onSubmit={handleCreateClient}
          className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5 shadow-soft"
        >
          <p className="text-sm text-muted">Não encontramos esse telefone. Vamos criar seu cadastro:</p>
          <Input id="name" label="Nome completo" required value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            id="email"
            label="E-mail (opcional)"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && <p className="text-sm text-critical">{error}</p>}
          <Button type="submit" disabled={submitting} className="self-start">
            {submitting ? "Enviando…" : "Cadastrar e Continuar"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      )}
    </StepShell>
  );
}

function RetryNotice({ message, onRetry }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-surface p-5 text-sm text-muted">
      <span>{message}</span>
      <Button variant="ghost" onClick={onRetry}>
        Tentar novamente
      </Button>
    </div>
  );
}

function ServiceStep({ onNext, onBack }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setLoadError(false);
    api
      .get("/public/services")
      .then(setServices)
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, [reloadKey]);

  return (
    <StepShell title="Escolha o serviço" subtitle="Selecione o que você deseja agendar.">
      {loading ? (
        <p className="text-sm text-muted">Carregando serviços…</p>
      ) : loadError ? (
        <RetryNotice
          message="Não foi possível carregar os serviços agora."
          onRetry={() => setReloadKey((k) => k + 1)}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {services.map((service) => (
            <button
              key={service.id}
              onClick={() => onNext(service)}
              className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-soft hover:border-accent/40"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{service.name}</span>
                <span className="tabular-nums font-medium text-accent-ink">
                  {formatMoney(service.priceCents)}
                </span>
              </div>
              {service.description && <p className="text-sm text-muted">{service.description}</p>}
              <span className="flex items-center gap-1 text-xs text-muted">
                <Clock className="h-3.5 w-3.5" />
                {service.durationMinutes} min
              </span>
            </button>
          ))}
        </div>
      )}
      <Button variant="ghost" onClick={onBack} className="self-start">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>
    </StepShell>
  );
}

function ProfessionalStep({ onNext, onBack }) {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setLoadError(false);
    api
      .get("/public/professionals")
      .then(setProfessionals)
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, [reloadKey]);

  return (
    <StepShell title="Escolha o profissional" subtitle="Quem vai te atender?">
      {loading ? (
        <p className="text-sm text-muted">Carregando profissionais…</p>
      ) : loadError ? (
        <RetryNotice
          message="Não foi possível carregar os profissionais agora."
          onRetry={() => setReloadKey((k) => k + 1)}
        />
      ) : professionals.length === 0 ? (
        <p className="text-sm text-muted">Nenhum profissional disponível no momento.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {professionals.map((professional) => (
            <button
              key={professional.id}
              onClick={() => onNext(professional)}
              className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-soft hover:border-accent/40"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/20 to-accent-blue/10 text-accent-ink">
                <UserRound className="h-6 w-6" />
              </div>
              <div>
                <div className="font-medium">{professional.name}</div>
                {professional.specialty && (
                  <div className="text-sm text-muted">{professional.specialty}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
      <Button variant="ghost" onClick={onBack} className="self-start">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>
    </StepShell>
  );
}

function formatDayLabel(dateStr) {
  const date = new Date(`${dateStr}T00:00:00`);
  const weekday = date.toLocaleDateString("pt-BR", { weekday: "short" });
  const day = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  return { weekday: weekday.replace(".", ""), day };
}

function DateTimeStep({ professional, service, onNext, onBack }) {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  useEffect(() => {
    setLoading(true);
    setLoadError(false);
    api
      .get(`/public/professionals/${professional.id}/availability?serviceId=${service.id}&days=21`)
      .then((data) => {
        setAvailability(data);
        const firstWithSlots = data.find((d) => d.slots.length > 0);
        if (firstWithSlots) setSelectedDate(firstWithSlots.date);
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, [professional.id, service.id, reloadKey]);

  const selectedDay = useMemo(
    () => availability.find((d) => d.date === selectedDate),
    [availability, selectedDate]
  );

  const nextAvailableDate = useMemo(
    () => availability.find((d) => d.slots.length > 0)?.date,
    [availability]
  );

  if (loading) {
    return (
      <StepShell title="Escolha data e horário">
        <p className="text-sm text-muted">Carregando disponibilidade…</p>
      </StepShell>
    );
  }

  if (loadError) {
    return (
      <StepShell title="Escolha data e horário">
        <RetryNotice
          message="Não foi possível carregar os horários disponíveis agora."
          onRetry={() => setReloadKey((k) => k + 1)}
        />
        <Button variant="ghost" onClick={onBack} className="self-start">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </StepShell>
    );
  }

  return (
    <StepShell title="Escolha data e horário" subtitle={`Com ${professional.name}`}>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {availability.map((day) => {
          const { weekday, day: dayLabel } = formatDayLabel(day.date);
          const disabled = day.slots.length === 0;
          const active = day.date === selectedDate;
          return (
            <button
              key={day.date}
              disabled={disabled}
              onClick={() => {
                setSelectedDate(day.date);
                setSelectedTime(null);
              }}
              className={`flex shrink-0 flex-col items-center gap-1 rounded-xl border px-3.5 py-2.5 text-xs font-medium transition duration-200 ${
                disabled
                  ? "cursor-not-allowed border-line text-muted/40"
                  : active
                    ? "border-transparent bg-gradient-to-br from-violet-500 to-accent-blue text-white"
                    : "border-line text-ink hover:bg-hover"
              }`}
            >
              <span className="uppercase">{weekday}</span>
              <span>{dayLabel}</span>
            </button>
          );
        })}
      </div>

      {selectedDay && selectedDay.slots.length === 0 && (
        <div className="rounded-2xl border border-line bg-surface p-5 text-sm text-muted">
          Não há horários livres neste dia.
          {nextAvailableDate && (
            <button
              className="ml-1 text-accent-ink hover:underline"
              onClick={() => setSelectedDate(nextAvailableDate)}
            >
              Ver próxima disponibilidade
            </button>
          )}
        </div>
      )}

      {selectedDay && selectedDay.slots.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedDay.slots.map((time) => (
            <button
              key={time}
              onClick={() => setSelectedTime(time)}
              className={`rounded-xl border px-4 py-2 text-sm font-medium tabular-nums transition duration-200 ${
                selectedTime === time
                  ? "border-transparent bg-gradient-to-br from-violet-500 to-accent-blue text-white"
                  : "border-line text-ink hover:bg-hover"
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <Button
          disabled={!selectedDate || !selectedTime}
          onClick={() => onNext({ date: selectedDate, time: selectedTime })}
        >
          Continuar
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </StepShell>
  );
}

function formatPhoneDisplay(digits) {
  if (!digits) return "";
  if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return digits;
}

function ConfirmStep({ booking, onConfirm, onBack, submitting, error }) {
  const { phone, service, professional, date, time } = booking;
  const dateLabel = new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  return (
    <StepShell title="Confirme seu agendamento">
      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-6 shadow-soft">
        <SummaryRow label="Telefone" value={formatPhoneDisplay(phone)} />
        <SummaryRow label="Serviço" value={service.name} />
        <SummaryRow label="Profissional" value={professional.name} />
        <SummaryRow label="Data" value={`${dateLabel} às ${time}`} />
        <SummaryRow label="Duração estimada" value={`${service.durationMinutes} min`} />
        <SummaryRow label="Valor" value={formatMoney(service.priceCents)} />
      </div>

      {error && <p className="text-sm text-critical">{error}</p>}

      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={onBack} disabled={submitting}>
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <Button onClick={onConfirm} disabled={submitting}>
          {submitting ? "Confirmando…" : "Confirmar Agendamento"}
          <Check className="h-4 w-4" />
        </Button>
      </div>
    </StepShell>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function SuccessStep({ appointment }) {
  const start = new Date(appointment.date);
  const end = new Date(start.getTime() + appointment.service.durationMinutes * 60000);
  const toGoogleFormat = (d) => d.toISOString().replace(/[-:]|\.\d{3}/g, "");

  const calendarUrl = new URL("https://calendar.google.com/calendar/render");
  calendarUrl.searchParams.set("action", "TEMPLATE");
  calendarUrl.searchParams.set("text", `${appointment.service.name} — Salão`);
  calendarUrl.searchParams.set("dates", `${toGoogleFormat(start)}/${toGoogleFormat(end)}`);
  calendarUrl.searchParams.set(
    "details",
    `Agendamento com ${appointment.professional.name}. Confirmação enviada por WhatsApp.`
  );

  return (
    <div className="flex flex-col items-center gap-6 py-10 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-accent-blue">
        <Check className="h-8 w-8 text-white" />
      </div>
      <div>
        <h2 className="text-xl font-semibold">Agendamento confirmado!</h2>
        <p className="mt-1 text-sm text-muted">
          Você vai receber a confirmação por WhatsApp em instantes.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <a href={calendarUrl.toString()} target="_blank" rel="noreferrer">
          <Button variant="ghost">
            <CalendarPlus className="h-4 w-4" />
            Adicionar ao Google Agenda
          </Button>
        </a>
        <Link to="/">
          <Button variant="ghost">Voltar ao início</Button>
        </Link>
      </div>
    </div>
  );
}

export default function BookingWizard() {
  const [step, setStep] = useState(0);
  const [booking, setBooking] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);

  async function handleConfirm() {
    setSubmitting(true);
    setError("");
    try {
      const dateTime = new Date(`${booking.date}T${booking.time}:00`);
      const appointment = await api.post("/public/appointments", {
        clientId: booking.client.id,
        serviceId: booking.service.id,
        professionalId: booking.professional.id,
        date: dateTime.toISOString(),
      });
      setConfirmedAppointment(appointment);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg px-6 py-16 text-ink">
      <div className="mx-auto max-w-2xl">
        {!confirmedAppointment && <ProgressSteps current={step} />}

        {confirmedAppointment ? (
          <SuccessStep appointment={confirmedAppointment} />
        ) : step === 0 ? (
          <PhoneStep
            onNext={(data) => {
              setBooking((b) => ({ ...b, ...data }));
              setStep(1);
            }}
          />
        ) : step === 1 ? (
          <ServiceStep
            onNext={(service) => {
              setBooking((b) => ({ ...b, service }));
              setStep(2);
            }}
            onBack={() => setStep(0)}
          />
        ) : step === 2 ? (
          <ProfessionalStep
            onNext={(professional) => {
              setBooking((b) => ({ ...b, professional }));
              setStep(3);
            }}
            onBack={() => setStep(1)}
          />
        ) : step === 3 ? (
          <DateTimeStep
            professional={booking.professional}
            service={booking.service}
            onNext={(data) => {
              setBooking((b) => ({ ...b, ...data }));
              setStep(4);
            }}
            onBack={() => setStep(2)}
          />
        ) : (
          <ConfirmStep
            booking={booking}
            onConfirm={handleConfirm}
            onBack={() => setStep(3)}
            submitting={submitting}
            error={error}
          />
        )}
      </div>
    </div>
  );
}
