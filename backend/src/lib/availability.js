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

function minutesToLabel(minutes) {
  const h = String(Math.floor(minutes / 60)).padStart(2, "0");
  const m = String(minutes % 60).padStart(2, "0");
  return `${h}:${m}`;
}

// Gera, para os próximos `days` dias, os horários livres de um profissional
// para um serviço (considerando a duração do serviço e agendamentos já
// existentes). Um dia sem WorkingHour cadastrada é considerado fechado.
export async function getAvailabilityRange({ professionalId, serviceId, days = 14 }) {
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.active) return null;

  const professional = await prisma.professional.findUnique({
    where: { id: professionalId },
    include: { workingHours: true },
  });
  if (!professional || !professional.active) return null;

  const workingByWeekday = new Map(professional.workingHours.map((h) => [h.weekday, h]));

  const startDate = dateOnly(new Date());
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + days);

  const existingAppointments = await prisma.appointment.findMany({
    where: {
      professionalId,
      status: { not: "CANCELADO" },
      date: { gte: startDate, lt: endDate },
    },
    include: { service: true },
  });

  const now = new Date();
  const result = [];

  for (let i = 0; i < days; i++) {
    const day = new Date(startDate);
    day.setDate(day.getDate() + i);

    const working = workingByWeekday.get(day.getDay());
    if (!working) {
      result.push({ date: formatDate(day), slots: [] });
      continue;
    }

    const busyRanges = existingAppointments
      .filter((a) => dateOnly(a.date).getTime() === day.getTime())
      .map((a) => {
        const start = a.date.getHours() * 60 + a.date.getMinutes();
        return [start, start + a.service.durationMinutes];
      });

    const slots = [];
    for (
      let minute = working.startMinute;
      minute + service.durationMinutes <= working.endMinute;
      minute += SLOT_STEP_MINUTES
    ) {
      const slotEnd = minute + service.durationMinutes;
      const overlaps = busyRanges.some(([busyStart, busyEnd]) => minute < busyEnd && slotEnd > busyStart);
      if (overlaps) continue;

      const slotDate = new Date(day);
      slotDate.setMinutes(minute);
      if (slotDate <= now) continue;

      slots.push(minutesToLabel(minute));
    }

    result.push({ date: formatDate(day), slots });
  }

  return result;
}

// Confere se um horário específico ainda está livre (usado antes de criar o
// agendamento público, para evitar condição de corrida entre dois clientes).
export async function isSlotFree({ professionalId, serviceId, date }) {
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) return false;

  const slotStart = new Date(date);
  const slotEnd = new Date(slotStart.getTime() + service.durationMinutes * 60000);

  const dayStart = dateOnly(slotStart);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const professional = await prisma.professional.findUnique({
    where: { id: professionalId },
    include: { workingHours: true },
  });
  if (!professional || !professional.active) return false;

  const working = professional.workingHours.find((h) => h.weekday === slotStart.getDay());
  if (!working) return false;

  const startMinute = slotStart.getHours() * 60 + slotStart.getMinutes();
  const endMinute = startMinute + service.durationMinutes;
  if (startMinute < working.startMinute || endMinute > working.endMinute) return false;
  if (slotStart <= new Date()) return false;

  const existingAppointments = await prisma.appointment.findMany({
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
