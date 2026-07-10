import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../middleware/errorHandler.js";

const professionalSchema = z.object({
  name: z.string().min(1),
  photoUrl: z.string().url().optional().nullable(),
  specialty: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  active: z.boolean().optional(),
});

const workingHourSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  startMinute: z.number().int().min(0).max(1439),
  endMinute: z.number().int().min(1).max(1440),
});

const workingHoursSchema = z
  .array(workingHourSchema)
  .refine((hours) => hours.every((h) => h.endMinute > h.startMinute), {
    message: "O horário final deve ser depois do horário inicial.",
  })
  .refine((hours) => new Set(hours.map((h) => h.weekday)).size === hours.length, {
    message: "Cada dia da semana pode ter apenas uma janela de horário.",
  });

const include = { workingHours: { orderBy: { weekday: "asc" } } };

export async function listProfessionals(req, res) {
  const onlyActive = req.query.active === "true";
  const professionals = await prisma.professional.findMany({
    where: onlyActive ? { active: true } : undefined,
    include,
    orderBy: { name: "asc" },
  });
  res.json(professionals);
}

export async function getProfessional(req, res) {
  const professional = await prisma.professional.findUnique({
    where: { id: req.params.id },
    include,
  });
  if (!professional) throw new HttpError(404, "Profissional não encontrado.");
  res.json(professional);
}

export async function createProfessional(req, res) {
  const data = professionalSchema.parse(req.body);
  const professional = await prisma.professional.create({ data, include });
  res.status(201).json(professional);
}

export async function updateProfessional(req, res) {
  const data = professionalSchema.partial().parse(req.body);
  const professional = await prisma.professional
    .update({ where: { id: req.params.id }, data, include })
    .catch(() => null);
  if (!professional) throw new HttpError(404, "Profissional não encontrado.");
  res.json(professional);
}

export async function deleteProfessional(req, res) {
  await prisma.professional.delete({ where: { id: req.params.id } }).catch(() => {
    throw new HttpError(404, "Profissional não encontrado.");
  });
  res.status(204).send();
}

export async function replaceWorkingHours(req, res) {
  const hours = workingHoursSchema.parse(req.body);

  const professional = await prisma.professional.findUnique({ where: { id: req.params.id } });
  if (!professional) throw new HttpError(404, "Profissional não encontrado.");

  await prisma.$transaction([
    prisma.workingHour.deleteMany({ where: { professionalId: req.params.id } }),
    prisma.workingHour.createMany({
      data: hours.map((h) => ({ ...h, professionalId: req.params.id })),
    }),
  ]);

  const updated = await prisma.professional.findUnique({ where: { id: req.params.id }, include });
  res.json(updated);
}
