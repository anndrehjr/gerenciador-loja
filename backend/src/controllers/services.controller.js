import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../middleware/errorHandler.js";

const serviceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  priceCents: z.number().int().nonnegative(),
  durationMinutes: z.number().int().positive().optional(),
  active: z.boolean().optional(),
});

export async function listServices(req, res) {
  const onlyActive = req.query.active === "true";
  const services = await prisma.service.findMany({
    where: { salonId: req.salonId, ...(onlyActive ? { active: true } : {}) },
    orderBy: { name: "asc" },
  });
  res.json(services);
}

export async function getService(req, res) {
  const service = await prisma.service.findFirst({
    where: { id: req.params.id, salonId: req.salonId },
  });
  if (!service) throw new HttpError(404, "Serviço não encontrado.");
  res.json(service);
}

export async function createService(req, res) {
  const data = serviceSchema.parse(req.body);
  const service = await prisma.service.create({ data: { ...data, salonId: req.salonId } });
  res.status(201).json(service);
}

export async function updateService(req, res) {
  const data = serviceSchema.partial().parse(req.body);

  const existing = await prisma.service.findFirst({
    where: { id: req.params.id, salonId: req.salonId },
  });
  if (!existing) throw new HttpError(404, "Serviço não encontrado.");

  const service = await prisma.service.update({ where: { id: existing.id }, data });
  res.json(service);
}

export async function deleteService(req, res) {
  const existing = await prisma.service.findFirst({
    where: { id: req.params.id, salonId: req.salonId },
  });
  if (!existing) throw new HttpError(404, "Serviço não encontrado.");

  await prisma.service.delete({ where: { id: existing.id } });
  res.status(204).send();
}
