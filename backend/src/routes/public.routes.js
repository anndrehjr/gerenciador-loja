import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  listPublicServices,
  listPublicProfessionals,
  lookupClientByPhone,
  createPublicClient,
  getPublicAvailability,
  createPublicAppointment,
  getPublicSalonInfo,
} from "../controllers/public.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas tentativas. Tente novamente em alguns minutos." },
});

// Disponibilidade é a rota pública mais cara (busca profissional + horários +
// férias/agendamentos e gera os slots) — mais generosa que o bookingLimiter
// porque o wizard consulta ela a cada troca de serviço/profissional, mas
// ainda assim limitada em vez de cair só no limite global genérico.
const availabilityLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas tentativas. Tente novamente em alguns minutos." },
});

// As rotas em si não sabem (nem precisam saber) se o salão foi resolvido
// pelo domínio da requisição ou por um :salonId na URL — isso é resolvido
// antes, por um middleware diferente montado em app.js pra cada um dos dois
// prefixos (/api/public e /api/public/s/:salonId). Aqui só existe uma vez.
export const publicRouter = Router();

publicRouter.get("/salon", asyncHandler(getPublicSalonInfo));
publicRouter.get("/services", asyncHandler(listPublicServices));
publicRouter.get("/professionals", asyncHandler(listPublicProfessionals));
publicRouter.get(
  "/professionals/:id/availability",
  availabilityLimiter,
  asyncHandler(getPublicAvailability)
);
publicRouter.get("/clients/lookup", bookingLimiter, asyncHandler(lookupClientByPhone));
publicRouter.post("/clients", bookingLimiter, asyncHandler(createPublicClient));
publicRouter.post("/appointments", bookingLimiter, asyncHandler(createPublicAppointment));
