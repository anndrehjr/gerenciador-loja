import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../middleware/errorHandler.js";
import { normalizePhone } from "../utils/phone.js";

const clientSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().nullable(),
  phone: z
    .string()
    .transform((v) => normalizePhone(v) || null)
    .optional()
    .nullable(),
});

export async function listClients(req, res) {
  const clients = await prisma.client.findMany({
    where: { salonId: req.salonId },
    orderBy: { name: "asc" },
  });
  res.json(clients);
}

export async function getClient(req, res) {
  const client = await prisma.client.findFirst({
    where: { id: req.params.id, salonId: req.salonId },
  });
  if (!client) throw new HttpError(404, "Cliente não encontrado.");
  res.json(client);
}

export async function createClient(req, res) {
  const data = clientSchema.parse(req.body);
  const client = await prisma.client.create({ data: { ...data, salonId: req.salonId } });
  res.status(201).json(client);
}

export async function updateClient(req, res) {
  const data = clientSchema.partial().parse(req.body);

  const existing = await prisma.client.findFirst({
    where: { id: req.params.id, salonId: req.salonId },
  });
  if (!existing) throw new HttpError(404, "Cliente não encontrado.");

  const client = await prisma.client.update({ where: { id: existing.id }, data });
  res.json(client);
}

export async function deleteClient(req, res) {
  const existing = await prisma.client.findFirst({
    where: { id: req.params.id, salonId: req.salonId },
  });
  if (!existing) throw new HttpError(404, "Cliente não encontrado.");

  await prisma.client.delete({ where: { id: existing.id } });
  res.status(204).send();
}
