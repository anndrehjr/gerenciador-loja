import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import { HttpError } from "./errorHandler.js";

// Resolve o salão pelo domínio próprio configurado (Salon.domain) — hoje não
// está montado em nenhuma rota (o site público usa /:salonId), fica pronto
// pra quando domínios próprios por salão entrarem em uso.
export async function resolveSalon(req, res, next) {
  let salon = await prisma.salon.findFirst({
    where: { domain: req.hostname, status: "ACTIVE" },
  });

  if (!salon && env.NODE_ENV !== "production") {
    salon = await prisma.salon.findFirst({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "asc" },
    });
  }

  if (!salon) {
    throw new HttpError(404, "Salão não encontrado.");
  }

  req.salon = salon;
  req.salonId = salon.id;
  next();
}

// Para as rotas montadas em /api/public/:salonId — usado pelo site público
// de cada salão (acesso por /:salonId no frontend). Não depende do Host da
// requisição, então funciona pra qualquer salão a partir do mesmo domínio
// da plataforma.
export async function resolveSalonByParam(req, res, next) {
  const salon = await prisma.salon.findFirst({
    where: { id: req.params.salonId, status: "ACTIVE" },
  });

  if (!salon) {
    throw new HttpError(404, "Salão não encontrado.");
  }

  req.salon = salon;
  req.salonId = salon.id;
  next();
}
