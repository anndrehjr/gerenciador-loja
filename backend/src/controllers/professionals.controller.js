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

function hasOverlapWithinDay(hours) {
  const byWeekday = new Map();
  for (const h of hours) {
    const list = byWeekday.get(h.weekday) || [];
    list.push(h);
    byWeekday.set(h.weekday, list);
  }
  for (const list of byWeekday.values()) {
    const sorted = [...list].sort((a, b) => a.startMinute - b.startMinute);
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].startMinute < sorted[i - 1].endMinute) return true;
    }
  }
  return false;
}

// Um dia pode ter mais de uma janela (turno dividido, ex.: manhã e tarde),
// desde que não se sobreponham.
const workingHoursSchema = z
  .array(workingHourSchema)
  .refine((hours) => hours.every((h) => h.endMinute > h.startMinute), {
    message: "O horário final deve ser depois do horário inicial.",
  })
  .refine((hours) => !hasOverlapWithinDay(hours), {
    message: "As janelas de horário no mesmo dia não podem se sobrepor.",
  });

const timeOffSchema = z
  .object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    reason: z.string().optional().nullable(),
  })
  .refine((d) => d.endDate >= d.startDate, {
    message: "A data final deve ser igual ou depois da data inicial.",
  });

const include = {
  workingHours: { orderBy: { weekday: "asc" } },
  timeOff: { orderBy: { startDate: "asc" } },
};

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

export async function createTimeOff(req, res) {
  const data = timeOffSchema.parse(req.body);

  const professional = await prisma.professional.findUnique({ where: { id: req.params.id } });
  if (!professional) throw new HttpError(404, "Profissional não encontrado.");

  const timeOff = await prisma.timeOff.create({
    data: { ...data, professionalId: req.params.id },
  });
  res.status(201).json(timeOff);
}

export async function deleteTimeOff(req, res) {
  await prisma.timeOff
    .delete({ where: { id: req.params.timeOffId } })
    .catch(() => {
      throw new HttpError(404, "Registro não encontrado.");
    });
  res.status(204).send();
}
