import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { hashPassword } from "../utils/password.js";
import { HttpError } from "../middleware/errorHandler.js";

const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const slugField = z.string().regex(SLUG_REGEX, "Use apenas letras minúsculas, números e hífen.");

const businessFields = {
  document: z.string().min(1).optional().nullable(),
  legalName: z.string().min(1).optional().nullable(),
  ownerName: z.string().min(1).optional().nullable(),
  ownerPhone: z.string().min(1).optional().nullable(),
  ownerWhatsapp: z.string().min(1).optional().nullable(),
  ownerEmail: z.string().email().optional().nullable().or(z.literal("").transform(() => null)),
  address: z.string().min(1).optional().nullable(),
  contractStatus: z.enum(["TRIAL", "ACTIVE", "PAST_DUE", "CANCELED"]).optional(),
  contractDueDate: z
    .string()
    .datetime()
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null)),
  notes: z.string().min(1).optional().nullable(),
};

const createSalonSchema = z.object({
  name: z.string().min(1),
  slug: slugField,
  domain: z.string().min(1).optional().nullable(),
  plan: z.string().min(1).optional(),
  adminName: z.string().min(1),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
  ...businessFields,
});

const updateSalonSchema = z.object({
  name: z.string().min(1).optional(),
  slug: slugField.optional(),
  domain: z.string().min(1).optional().nullable(),
  plan: z.string().min(1).optional(),
  ...businessFields,
});

const statusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED"]),
});

const BUSINESS_FIELD_KEYS = Object.keys(businessFields);

// Prisma ignora chaves com valor `undefined`, então dá pra sempre espalhar
// os campos cadastrais opcionais sem checar um por um se vieram no payload.
function pickBusinessFields(data) {
  const picked = {};
  for (const key of BUSINESS_FIELD_KEYS) picked[key] = data[key];
  return picked;
}

const withCounts = {
  _count: {
    select: { clients: true, services: true, professionals: true, appointments: true, users: true },
  },
};

export async function listSalons(req, res) {
  const salons = await prisma.salon.findMany({
    include: withCounts,
    orderBy: { createdAt: "desc" },
  });
  res.json(salons);
}

export async function getSalon(req, res) {
  const salon = await prisma.salon.findUnique({
    where: { id: req.params.id },
    include: { ...withCounts, users: { select: { id: true, name: true, email: true, role: true } } },
  });
  if (!salon) throw new HttpError(404, "Salão não encontrado.");
  res.json(salon);
}

export async function createSalon(req, res) {
  const data = createSalonSchema.parse(req.body);
  const passwordHash = await hashPassword(data.adminPassword);

  const salon = await prisma
    .$transaction(async (tx) => {
      const created = await tx.salon.create({
        data: {
          name: data.name,
          slug: data.slug,
          domain: data.domain || null,
          plan: data.plan || "starter",
          ...pickBusinessFields(data),
        },
      });
      await tx.user.create({
        data: {
          name: data.adminName,
          email: data.adminEmail,
          passwordHash,
          role: "ADMIN",
          salonId: created.id,
        },
      });
      return created;
    })
    .catch((err) => {
      if (err.code === "P2002") {
        throw new HttpError(409, "Já existe um salão com esse slug/domínio, ou um usuário com esse email.");
      }
      throw err;
    });

  res.status(201).json(salon);
}

export async function updateSalon(req, res) {
  const data = updateSalonSchema.parse(req.body);

  const salon = await prisma.salon
    .update({ where: { id: req.params.id }, data })
    .catch((err) => {
      if (err.code === "P2025") throw new HttpError(404, "Salão não encontrado.");
      if (err.code === "P2002") throw new HttpError(409, "Slug ou domínio já em uso por outro salão.");
      throw err;
    });

  res.json(salon);
}

export async function setSalonStatus(req, res) {
  const { status } = statusSchema.parse(req.body);

  const salon = await prisma.salon
    .update({ where: { id: req.params.id }, data: { status } })
    .catch((err) => {
      if (err.code === "P2025") throw new HttpError(404, "Salão não encontrado.");
      throw err;
    });

  res.json(salon);
}

export async function deleteSalon(req, res) {
  await prisma.salon.delete({ where: { id: req.params.id } }).catch((err) => {
    if (err.code === "P2025") throw new HttpError(404, "Salão não encontrado.");
    throw err;
  });
  res.status(204).send();
}
