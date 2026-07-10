import { prisma } from "../lib/prisma.js";

export async function listPublicServices(req, res) {
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, description: true, priceCents: true },
  });
  res.json(services);
}
