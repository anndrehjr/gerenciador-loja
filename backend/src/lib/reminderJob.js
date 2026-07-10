import { prisma } from "./prisma.js";
import { env } from "../config/env.js";
import { isWhatsAppEnabled, sendAppointmentReminder } from "./whatsapp.js";

const CHECK_INTERVAL_MS = 10 * 60 * 1000; // 10 minutos

async function checkAndSendReminders() {
  const windowEnd = new Date(Date.now() + env.WHATSAPP_REMINDER_HOURS_BEFORE * 60 * 60 * 1000);

  const dueAppointments = await prisma.appointment.findMany({
    where: {
      status: { in: ["AGENDADO", "CONFIRMADO"] },
      reminderSentAt: null,
      date: { gte: new Date(), lte: windowEnd },
    },
    include: { client: true, service: true },
  });

  for (const appointment of dueAppointments) {
    await sendAppointmentReminder(appointment);
    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { reminderSentAt: new Date() },
    });
  }

  if (dueAppointments.length > 0) {
    console.log(`[whatsapp] lembretes enviados: ${dueAppointments.length}`);
  }
}

export function startReminderJob() {
  if (!isWhatsAppEnabled) return;
  checkAndSendReminders().catch((err) => console.error("[whatsapp] erro no job de lembrete:", err));
  setInterval(() => {
    checkAndSendReminders().catch((err) => console.error("[whatsapp] erro no job de lembrete:", err));
  }, CHECK_INTERVAL_MS);
}
