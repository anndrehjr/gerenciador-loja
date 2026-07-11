import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../middleware/errorHandler.js";
import { normalizePhone } from "../utils/phone.js";
import { getAvailabilityRange, isSlotFree } from "../lib/availability.js";
import { sendAppointmentConfirmation } from "../lib/whatsapp.js";

const SLOT_TAKEN_MESSAGE = "Esse horário acabou de ficar indisponível. Escolha outro.";

export async function listPublicServices(req, res) {
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, description: true, priceCents: true, durationMinutes: true },
  });
  res.json(services);
}

export async function listPublicProfessionals(req, res) {
  const professionals = await prisma.professional.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, photoUrl: true, specialty: true, bio: true },
  });
  res.json(professionals);
}

export async function lookupClientByPhone(req, res) {
  const phone = normalizePhone(String(req.query.phone || ""));
  if (!phone) throw new HttpError(400, "Informe um telefone.");

  const client = await prisma.client.findUnique({
    where: { phone },
    include: {
      appointments: {
        orderBy: { date: "desc" },
        take: 1,
        include: { service: true, professional: true },
      },
    },
  });

  if (!client) {
    return res.json({ found: false });
  }

  const last = client.appointments[0];
  res.json({
    found: true,
    client: { id: client.id, name: client.name, phone: client.phone, email: client.email },
    lastAppointment: last
      ? {
          serviceId: last.serviceId,
          serviceName: last.service.name,
          professionalId: last.professionalId,
          professionalName: last.professional?.name ?? null,
        }
      : null,
  });
}

const newClientSchema = z.object({
  name: z.string().min(1),
  phone: z
    .string()
    .transform(normalizePhone)
    .refine((v) => v.length >= 10, "Telefone inválido."),
  email: z.string().email().optional().nullable(),
});

export async function createPublicClient(req, res) {
  const data = newClientSchema.parse(req.body);

  const existing = await prisma.client.findUnique({ where: { phone: data.phone } });
  if (existing) {
    return res.status(200).json(existing);
  }

  const client = await prisma.client.create({ data }).catch((err) => {
    if (err.code === "P2002") throw new HttpError(409, "Já existe um cliente com esses dados.");
    throw err;
  });
  res.status(201).json(client);
}

const availabilityQuerySchema = z.object({
  serviceId: z.string().min(1),
  days: z.coerce.number().int().min(1).max(60).optional(),
});

export async function getPublicAvailability(req, res) {
  const { serviceId, days } = availabilityQuerySchema.parse(req.query);
  const professional = await prisma.professional.findUnique({
    where: { id: req.params.id },
  });
  if (!professional) throw new HttpError(404, "Profissional não encontrado.");

  const availability = await getAvailabilityRange({
    professionalId: req.params.id,
    serviceId,
    days: days || 21,
  });
  if (!availability) throw new HttpError(404, "Serviço ou profissional indisponível.");

  res.json(availability);
}

const bookingSchema = z.object({
  clientId: z.string().min(1),
  serviceId: z.string().min(1),
  professionalId: z.string().min(1),
  date: z.coerce.date(),
});

export async function createPublicAppointment(req, res) {
  const data = bookingSchema.parse(req.body);

  const [client, service, professional] = await Promise.all([
    prisma.client.findUnique({ where: { id: data.clientId } }),
    prisma.service.findUnique({ where: { id: data.serviceId } }),
    prisma.professional.findUnique({ where: { id: data.professionalId } }),
  ]);
  if (!client) throw new HttpError(404, "Cliente não encontrado.");
  if (!service || !service.active) throw new HttpError(404, "Serviço indisponível.");
  if (!professional || !professional.active) throw new HttpError(404, "Profissional indisponível.");

  // Checagem + criação rodam na mesma transação serializable: se dois
  // clientes tentarem reservar o mesmo horário ao mesmo tempo, o Postgres
  // aborta uma das transações em vez de deixar as duas passarem.
  const appointment = await prisma
    .$transaction(
      async (tx) => {
        const free = await isSlotFree(
          { professionalId: data.professionalId, serviceId: data.serviceId, date: data.date },
          tx
        );
        if (!free) throw new HttpError(409, SLOT_TAKEN_MESSAGE);

        return tx.appointment.create({
          data,
          include: { client: true, service: true, professional: true },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    )
    .catch((err) => {
      if (err instanceof HttpError) throw err;
      if (err.code === "P2034") throw new HttpError(409, SLOT_TAKEN_MESSAGE);
      throw err;
    });

  res.status(201).json(appointment);
  sendAppointmentConfirmation(appointment).catch(() => {});
}
