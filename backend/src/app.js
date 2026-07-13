import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { env } from "./config/env.js";
import { authRouter } from "./routes/auth.routes.js";
import { clientsRouter } from "./routes/clients.routes.js";
import { servicesRouter } from "./routes/services.routes.js";
import { appointmentsRouter } from "./routes/appointments.routes.js";
import { professionalsRouter } from "./routes/professionals.routes.js";
import { publicRouter } from "./routes/public.routes.js";
import { masterRouter } from "./routes/master.routes.js";
import { salonRouter } from "./routes/salon.routes.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";
import { resolveSalonByParam } from "./middleware/tenant.js";
import { asyncHandler } from "./utils/asyncHandler.js";

export const app = express();

// Cadeia real até a API: Cloudflare (proxy) -> nginx-proxy-manager -> nginx
// do container "app" -> aqui. Confiar em "true" aceitaria qualquer valor que
// o próprio visitante mandasse em X-Forwarded-For, permitindo forjar o IP e
// contornar o rate limit (login e agendamento público). Com um número fixo
// de saltos, o Express ignora qualquer coisa além dos 3 proxies conhecidos.
app.set("trust proxy", 3);

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
if (env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas tentativas de login. Tente novamente em alguns minutos." },
  skipSuccessfulRequests: true,
});

app.use("/api", apiLimiter);
app.use("/api/auth/login", loginLimiter);
app.use("/api/auth", authRouter);

// Site público do salão em /:salonId — resolve o salão pelo id na URL, sem
// precisar de DNS/domínio próprio configurado (resolveSalon por domínio
// segue disponível em tenant.js pra quando domínios próprios entrarem em uso).
app.use("/api/public/:salonId", asyncHandler(resolveSalonByParam), publicRouter);

app.use("/api/clients", clientsRouter);
app.use("/api/services", servicesRouter);
app.use("/api/appointments", appointmentsRouter);
app.use("/api/professionals", professionalsRouter);
app.use("/api/salon", salonRouter);
app.use("/api/master", masterRouter);

app.use(notFoundHandler);
app.use(errorHandler);
