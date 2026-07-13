import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../middleware/errorHandler.js";

const serviceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  priceCents: z.number().int().nonnegative(),
  durationMinutes: z.number().int().positive().optional(),
  active: z.boolean().optional(),
  // Sem essa chave = não mexe nos vínculos. Array vazio = desvincula todo
  // mundo (o serviço volta a aceitar qualquer profissional do salão).
  professionalIds: z.array(z.string()).optional(),
});

const PROFESSIONAL_SELECT = { id: true, name: true, photoUrl: true, specialty: true };

const withProfessionals = {
  professionals: { include: { professional: { select: PROFESSIONAL_SELECT } } },
};

function flattenProfessionals(service) {
  if (!service) return service;
  const { professionals, ...rest } = service;
  return { ...rest, professionals: professionals.map((p) => p.professional) };
}

// Confere que cada id de profissional realmente pertence a esse salão antes
// de vincular — sem isso, um admin poderia vincular (e vazar a existência
// de) um profissional de outro salão só adivinhando o id.
async function assertProfessionalsOwnedBySalon(professionalIds, salonId) {
  if (!professionalIds.length) return;
  const count = await prisma.professional.count({ where: { id: { in: professionalIds }, salonId } });
  if (count !== professionalIds.length) {
    throw new HttpError(400, "Um ou mais profissionais informados não pertencem a este salão.");
  }
}

async function setServiceProfessionals(serviceId, professionalIds, salonId) {
  await assertProfessionalsOwnedBySalon(professionalIds, salonId);
  await prisma.$transaction([
    prisma.serviceProfessional.deleteMany({ where: { serviceId } }),
    ...(professionalIds.length
      ? [
          prisma.serviceProfessional.createMany({
            data: professionalIds.map((professionalId) => ({ serviceId, professionalId, salonId })),
          }),
        ]
      : []),
  ]);
}

export async function listServices(req, res) {
  const onlyActive = req.query.active === "true";
  const services = await prisma.service.findMany({
    where: { salonId: req.salonId, ...(onlyActive ? { active: true } : {}) },
    orderBy: { name: "asc" },
    include: withProfessionals,
  });
  res.json(services.map(flattenProfessionals));
}

export async function getService(req, res) {
  const service = await prisma.service.findFirst({
    where: { id: req.params.id, salonId: req.salonId },
    include: withProfessionals,
  });
  if (!service) throw new HttpError(404, "Serviço não encontrado.");
  res.json(flattenProfessionals(service));
}

export async function createService(req, res) {
  const { professionalIds, ...data } = serviceSchema.parse(req.body);
  const service = await prisma.service.create({ data: { ...data, salonId: req.salonId } });

  if (professionalIds) {
    await setServiceProfessionals(service.id, professionalIds, req.salonId);
  }

  const full = await prisma.service.findUnique({ where: { id: service.id }, include: withProfessionals });
  res.status(201).json(flattenProfessionals(full));
}

export async function updateService(req, res) {
  const { professionalIds, ...data } = serviceSchema.partial().parse(req.body);

  const existing = await prisma.service.findFirst({
    where: { id: req.params.id, salonId: req.salonId },
  });
  if (!existing) throw new HttpError(404, "Serviço não encontrado.");

  await prisma.service.update({ where: { id: existing.id }, data });

  if (professionalIds !== undefined) {
    await setServiceProfessionals(existing.id, professionalIds, req.salonId);
  }

  const full = await prisma.service.findUnique({ where: { id: existing.id }, include: withProfessionals });
  res.json(flattenProfessionals(full));
}

export async function deleteService(req, res) {
  const existing = await prisma.service.findFirst({
    where: { id: req.params.id, salonId: req.salonId },
  });
  if (!existing) throw new HttpError(404, "Serviço não encontrado.");

  await prisma.service.delete({ where: { id: existing.id } });
  res.status(204).send();
}
