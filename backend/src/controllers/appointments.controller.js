import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../middleware/errorHandler.js";
import { sendAppointmentConfirmation, sendAppointmentCancellation } from "../lib/whatsapp.js";

const STATUS_VALUES = ["AGENDADO", "CONFIRMADO", "CONCLUIDO", "CANCELADO"];

const appointmentSchema = z.object({
  clientId: z.string().min(1),
  serviceId: z.string().min(1),
  date: z.coerce.date(),
  status: z.enum(STATUS_VALUES).optional(),
  notes: z.string().optional().nullable(),
});

const include = { client: true, service: true };

export async function listAppointments(req, res) {
  const { clientId, serviceId, status, from, to } = req.query;

  const where = {
    ...(clientId ? { clientId } : {}),
    ...(serviceId ? { serviceId } : {}),
    ...(status ? { status } : {}),
    ...(from || to
      ? {
          date: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {}),
  };

  const appointments = await prisma.appointment.findMany({
    where,
    include,
    orderBy: { date: "desc" },
  });
  res.json(appointments);
}

export async function getAppointment(req, res) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: req.params.id },
    include,
  });
  if (!appointment) throw new HttpError(404, "Agendamento não encontrado.");
  res.json(appointment);
}

export async function createAppointment(req, res) {
  const data = appointmentSchema.parse(req.body);
  const appointment = await prisma.appointment.create({ data, include });
  res.status(201).json(appointment);
  sendAppointmentConfirmation(appointment).catch(() => {});
}

export async function updateAppointment(req, res) {
  const data = appointmentSchema.partial().parse(req.body);

  const before = await prisma.appointment.findUnique({ where: { id: req.params.id } });
  if (!before) throw new HttpError(404, "Agendamento não encontrado.");

  const appointment = await prisma.appointment
    .update({ where: { id: req.params.id }, data, include })
    .catch(() => null);
  if (!appointment) throw new HttpError(404, "Agendamento não encontrado.");
  res.json(appointment);

  if (data.status === "CANCELADO" && before.status !== "CANCELADO") {
    sendAppointmentCancellation(appointment).catch(() => {});
  }
}

export async function deleteAppointment(req, res) {
  await prisma.appointment.delete({ where: { id: req.params.id } }).catch(() => {
    throw new HttpError(404, "Agendamento não encontrado.");
  });
  res.status(204).send();
}
