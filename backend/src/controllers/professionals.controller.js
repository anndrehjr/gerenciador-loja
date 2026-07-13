import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../middleware/errorHandler.js";

const professionalSchema = z.object({
  name: z.string().min(1),
  photoUrl: z
    .string()
    .url()
    .refine((url) => /^https?:\/\//i.test(url), "A URL da foto precisa ser http:// ou https://")
    .optional()
    .nullable(),
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
    where: { salonId: req.salonId, ...(onlyActive ? { active: true } : {}) },
    include,
    orderBy: { name: "asc" },
  });
  res.json(professionals);
}

export async function getProfessional(req, res) {
  const professional = await prisma.professional.findFirst({
    where: { id: req.params.id, salonId: req.salonId },
    include,
  });
  if (!professional) throw new HttpError(404, "Profissional não encontrado.");
  res.json(professional);
}

export async function createProfessional(req, res) {
  const data = professionalSchema.parse(req.body);
  const professional = await prisma.professional.create({
    data: { ...data, salonId: req.salonId },
    include,
  });
  res.status(201).json(professional);
}

export async function updateProfessional(req, res) {
  const data = professionalSchema.partial().parse(req.body);

  const existing = await prisma.professional.findFirst({
    where: { id: req.params.id, salonId: req.salonId },
  });
  if (!existing) throw new HttpError(404, "Profissional não encontrado.");

  const professional = await prisma.professional.update({
    where: { id: existing.id },
    data,
    include,
  });
  res.json(professional);
}

export async function deleteProfessional(req, res) {
  const existing = await prisma.professional.findFirst({
    where: { id: req.params.id, salonId: req.salonId },
  });
  if (!existing) throw new HttpError(404, "Profissional não encontrado.");

  await prisma.professional.delete({ where: { id: existing.id } });
  res.status(204).send();
}

export async function replaceWorkingHours(req, res) {
  const hours = workingHoursSchema.parse(req.body);

  const professional = await prisma.professional.findFirst({
    where: { id: req.params.id, salonId: req.salonId },
  });
  if (!professional) throw new HttpError(404, "Profissional não encontrado.");

  await prisma.$transaction([
    prisma.workingHour.deleteMany({ where: { professionalId: professional.id } }),
    prisma.workingHour.createMany({
      data: hours.map((h) => ({ ...h, professionalId: professional.id, salonId: req.salonId })),
    }),
  ]);

  const updated = await prisma.professional.findUnique({ where: { id: professional.id }, include });
  res.json(updated);
}

export async function createTimeOff(req, res) {
  const data = timeOffSchema.parse(req.body);

  const professional = await prisma.professional.findFirst({
    where: { id: req.params.id, salonId: req.salonId },
  });
  if (!professional) throw new HttpError(404, "Profissional não encontrado.");

  const timeOff = await prisma.timeOff.create({
    data: { ...data, professionalId: professional.id, salonId: req.salonId },
  });
  res.status(201).json(timeOff);
}

export async function deleteTimeOff(req, res) {
  const existing = await prisma.timeOff.findFirst({
    where: { id: req.params.timeOffId, salonId: req.salonId, professionalId: req.params.id },
  });
  if (!existing) throw new HttpError(404, "Registro não encontrado.");

  await prisma.timeOff.delete({ where: { id: existing.id } });
  res.status(204).send();
}
