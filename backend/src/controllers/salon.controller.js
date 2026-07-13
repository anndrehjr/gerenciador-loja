import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../middleware/errorHandler.js";
import { planFeatures } from "../lib/plans.js";

const TEMPLATES = ["beauty-luxury", "premium-barber", "minimal-studio", "spa-zen"];

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  logoUrl: z.string().url().optional().nullable(),
  primaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Use um hex válido, ex.: #8B5CF6")
    .optional()
    .nullable(),
  template: z.enum(TEMPLATES).optional(),
  // Só plano PREMIUM pode gravar isso — ver checagem em updateMySalon.
  // Objeto livre: cada bloco da landing lê só as chaves que reconhece.
  customization: z.record(z.any()).optional().nullable(),
});

const SELECT_FIELDS = {
  id: true,
  name: true,
  slug: true,
  domain: true,
  plan: true,
  category: true,
  template: true,
  logoUrl: true,
  primaryColor: true,
  customization: true,
};

// Diferente das rotas do painel master, aqui o salão nunca vem da URL — é
// sempre o do usuário logado (req.salonId), então não tem como um admin
// editar a marca de outro salão nem por engano.
export async function getMySalon(req, res) {
  const salon = await prisma.salon.findUnique({
    where: { id: req.salonId },
    select: SELECT_FIELDS,
  });
  res.json(salon);
}

export async function updateMySalon(req, res) {
  const data = updateSchema.parse(req.body);

  if (data.customization !== undefined) {
    const salon = await prisma.salon.findUnique({ where: { id: req.salonId }, select: { plan: true } });
    if (!planFeatures(salon.plan).fullCustomization) {
      throw new HttpError(403, "Personalização completa é exclusiva do plano PREMIUM.");
    }
  }

  const salon = await prisma.salon.update({
    where: { id: req.salonId },
    data,
    select: SELECT_FIELDS,
  });
  res.json(salon);
}
