import { prisma } from "./prisma.js";

const SLOT_STEP_MINUTES = 15;

function dateOnly(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function minutesToLabel(minutes) {
  const h = String(Math.floor(minutes / 60)).padStart(2, "0");
  const m = String(minutes % 60).padStart(2, "0");
  return `${h}:${m}`;
}

// --- Funções puras (sem banco), fáceis de testar isoladamente ---

// Dado o(s) período(s) de trabalho de um dia (pode ser mais de um, em caso de
// turno dividido), os intervalos já ocupados e a duração do serviço, devolve
// os horários livres (em "HH:mm") respeitando o grid de 15 em 15 minutos.
export function computeFreeSlots({
  windows,
  busyRanges = [],
  durationMinutes,
  stepMinutes = SLOT_STEP_MINUTES,
  minStartMinute = 0,
}) {
  const slots = new Set();

  for (const window of windows) {
    for (
      let minute = window.startMinute;
      minute + durationMinutes <= window.endMinute;
      minute += stepMinutes
    ) {
      if (minute < minStartMinute) continue;

      const slotEnd = minute + durationMinutes;
      const overlapsBusy = busyRanges.some(([busyStart, busyEnd]) => minute < busyEnd && slotEnd > busyStart);
      if (!overlapsBusy) slots.add(minutesToLabel(minute));
    }
  }

  return [...slots].sort();
}

// Confere se um intervalo [startMinute, endMinute) cabe inteiramente dentro
// de alguma das janelas de trabalho do dia.
export function isWithinWindows(startMinute, endMinute, windows) {
  return windows.some((w) => startMinute >= w.startMinute && endMinute <= w.endMinute);
}

// --- Funções que consultam o banco (aceitam `client` para rodar dentro de uma transação) ---

// Gera, para os próximos `days` dias, os horários livres de um profissional
// para um serviço (considerando janelas de trabalho — inclusive turno
// dividido —, férias/folgas e agendamentos já existentes).
export async function getAvailabilityRange({ professionalId, serviceId, days = 14 }, client = prisma) {
  const service = await client.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.active) return null;

  const professional = await client.professional.findUnique({
    where: { id: professionalId },
    include: { workingHours: true, timeOff: true },
  });
  if (!professional || !professional.active) return null;

  const windowsByWeekday = new Map();
  for (const wh of professional.workingHours) {
    const list = windowsByWeekday.get(wh.weekday) || [];
    list.push({ startMinute: wh.startMinute, endMinute: wh.endMinute });
    windowsByWeekday.set(wh.weekday, list);
  }

  const timeOffRanges = professional.timeOff.map((t) => ({
    start: dateOnly(t.startDate),
    end: dateOnly(t.endDate),
  }));

  const startDate = dateOnly(new Date());
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + days);

  const existingAppointments = await client.appointment.findMany({
    where: {
      professionalId,
      status: { not: "CANCELADO" },
      date: { gte: startDate, lt: endDate },
    },
    include: { service: true },
  });

  const now = new Date();
  const todayStart = dateOnly(now);
  const result = [];

  for (let i = 0; i < days; i++) {
    const day = new Date(startDate);
    day.setDate(day.getDate() + i);

    const windows = windowsByWeekday.get(day.getDay()) || [];
    const blocked = timeOffRanges.some((r) => day >= r.start && day <= r.end);

    if (windows.length === 0 || blocked) {
      result.push({ date: formatDate(day), slots: [] });
      continue;
    }

    const busyRanges = existingAppointments
      .filter((a) => dateOnly(a.date).getTime() === day.getTime())
      .map((a) => {
        const start = a.date.getHours() * 60 + a.date.getMinutes();
        return [start, start + a.service.durationMinutes];
      });

    const minStartMinute = day.getTime() === todayStart.getTime() ? now.getHours() * 60 + now.getMinutes() + 1 : 0;

    const slots = computeFreeSlots({
      windows,
      busyRanges,
      durationMinutes: service.durationMinutes,
      minStartMinute,
    });

    result.push({ date: formatDate(day), slots });
  }

  return result;
}

// Confere se um horário específico ainda está livre. Recebe opcionalmente um
// `client` de transação, para ser chamada dentro do mesmo `$transaction` que
// cria o agendamento (evita condição de corrida entre duas reservas).
export async function isSlotFree({ professionalId, serviceId, date }, client = prisma) {
  const service = await client.service.findUnique({ where: { id: serviceId } });
  if (!service) return false;

  const slotStart = new Date(date);
  if (slotStart <= new Date()) return false;

  const dayStart = dateOnly(slotStart);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const professional = await client.professional.findUnique({
    where: { id: professionalId },
    include: { workingHours: true, timeOff: true },
  });
  if (!professional || !professional.active) return false;

  const blocked = professional.timeOff.some(
    (t) => dayStart >= dateOnly(t.startDate) && dayStart <= dateOnly(t.endDate)
  );
  if (blocked) return false;

  const windows = professional.workingHours
    .filter((h) => h.weekday === slotStart.getDay())
    .map((h) => ({ startMinute: h.startMinute, endMinute: h.endMinute }));

  const startMinute = slotStart.getHours() * 60 + slotStart.getMinutes();
  const endMinute = startMinute + service.durationMinutes;
  if (!isWithinWindows(startMinute, endMinute, windows)) return false;

  const existingAppointments = await client.appointment.findMany({
    where: {
      professionalId,
      status: { not: "CANCELADO" },
      date: { gte: dayStart, lt: dayEnd },
    },
    include: { service: true },
  });

  return existingAppointments.every((a) => {
    const busyStart = a.date.getHours() * 60 + a.date.getMinutes();
    const busyEnd = busyStart + a.service.durationMinutes;
    return startMinute >= busyEnd || endMinute <= busyStart;
  });
}
