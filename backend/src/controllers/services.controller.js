import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../middleware/errorHandler.js";

const serviceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  priceCents: z.number().int().nonnegative(),
  active: z.boolean().optional(),
});

export async function listServices(req, res) {
  const onlyActive = req.query.active === "true";
  const services = await prisma.service.findMany({
    where: onlyActive ? { active: true } : undefined,
    orderBy: { name: "asc" },
  });
  res.json(services);
}

export async function getService(req, res) {
  const service = await prisma.service.findUnique({ where: { id: req.params.id } });
  if (!service) throw new HttpError(404, "Serviço não encontrado.");
  res.json(service);
}

export async function createService(req, res) {
  const data = serviceSchema.parse(req.body);
  const service = await prisma.service.create({ data });
  res.status(201).json(service);
}

export async function updateService(req, res) {
  const data = serviceSchema.partial().parse(req.body);
  const service = await prisma.service
    .update({ where: { id: req.params.id }, data })
    .catch(() => null);
  if (!service) throw new HttpError(404, "Serviço não encontrado.");
  res.json(service);
}

export async function deleteService(req, res) {
  await prisma.service.delete({ where: { id: req.params.id } }).catch(() => {
    throw new HttpError(404, "Serviço não encontrado.");
  });
  res.status(204).send();
}
