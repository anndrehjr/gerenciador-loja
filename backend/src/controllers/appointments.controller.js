import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../middleware/errorHandler.js";
import { sendAppointmentConfirmation, sendAppointmentCancellation } from "../lib/whatsapp.js";

const STATUS_VALUES = ["AGENDADO", "CONFIRMADO", "CONCLUIDO", "CANCELADO"];

const appointmentSchema = z.object({
  clientId: z.string().min(1),
  serviceId: z.string().min(1),
  professionalId: z.string().min(1).optional().nullable(),
  date: z.coerce.date(),
  status: z.enum(STATUS_VALUES).optional(),
  notes: z.string().optional().nullable(),
});

const include = { client: true, service: true, professional: true };

// Confere que cliente/serviço/profissional citados no payload pertencem ao
// mesmo salão do usuário logado — sem isso, um admin poderia (por acidente ou
// não) criar um agendamento apontando pra um cliente de outro salão.
async function assertOwnedByCurrentSalon(salonId, { clientId, serviceId, professionalId }) {
  const checks = [prisma.client.findFirst({ where: { id: clientId, salonId } })];
  checks.push(prisma.service.findFirst({ where: { id: serviceId, salonId } }));
  if (professionalId) {
    checks.push(prisma.professional.findFirst({ where: { id: professionalId, salonId } }));
  }
  const results = await Promise.all(checks);
  if (results.some((r) => !r)) {
    throw new HttpError(400, "Cliente, serviço ou profissional inválido.");
  }
}

export async function listAppointments(req, res) {
  const { clientId, serviceId, status, from, to } = req.query;

  const where = {
    salonId: req.salonId,
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
  const appointment = await prisma.appointment.findFirst({
    where: { id: req.params.id, salonId: req.salonId },
    include,
  });
  if (!appointment) throw new HttpError(404, "Agendamento não encontrado.");
  res.json(appointment);
}

export async function createAppointment(req, res) {
  const data = appointmentSchema.parse(req.body);
  await assertOwnedByCurrentSalon(req.salonId, data);

  const appointment = await prisma.appointment.create({
    data: { ...data, salonId: req.salonId },
    include,
  });
  res.status(201).json(appointment);
  sendAppointmentConfirmation(appointment).catch(() => {});
}

export async function updateAppointment(req, res) {
  const data = appointmentSchema.partial().parse(req.body);

  const before = await prisma.appointment.findFirst({
    where: { id: req.params.id, salonId: req.salonId },
  });
  if (!before) throw new HttpError(404, "Agendamento não encontrado.");

  if (data.clientId || data.serviceId || data.professionalId) {
    await assertOwnedByCurrentSalon(req.salonId, {
      clientId: data.clientId || before.clientId,
      serviceId: data.serviceId || before.serviceId,
      professionalId: data.professionalId !== undefined ? data.professionalId : before.professionalId,
    });
  }

  const appointment = await prisma.appointment.update({
    where: { id: before.id },
    data,
    include,
  });
  res.json(appointment);

  if (data.status === "CANCELADO" && before.status !== "CANCELADO") {
    sendAppointmentCancellation(appointment).catch(() => {});
  }
}

export async function deleteAppointment(req, res) {
  const existing = await prisma.appointment.findFirst({
    where: { id: req.params.id, salonId: req.salonId },
  });
  if (!existing) throw new HttpError(404, "Agendamento não encontrado.");

  await prisma.appointment.delete({ where: { id: existing.id } });
  res.status(204).send();
}
