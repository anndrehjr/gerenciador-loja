import { z } from "zod";
import { prisma } from "../lib/prisma.js";

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
});

// Diferente das rotas do painel master, aqui o salão nunca vem da URL — é
// sempre o do usuário logado (req.salonId), então não tem como um admin
// editar a marca de outro salão nem por engano.
export async function getMySalon(req, res) {
  const salon = await prisma.salon.findUnique({
    where: { id: req.salonId },
    select: {
      id: true,
      name: true,
      slug: true,
      domain: true,
      plan: true,
      template: true,
      logoUrl: true,
      primaryColor: true,
    },
  });
  res.json(salon);
}

export async function updateMySalon(req, res) {
  const data = updateSchema.parse(req.body);
  const salon = await prisma.salon.update({
    where: { id: req.salonId },
    data,
    select: {
      id: true,
      name: true,
      slug: true,
      domain: true,
      plan: true,
      template: true,
      logoUrl: true,
      primaryColor: true,
    },
  });
  res.json(salon);
}
