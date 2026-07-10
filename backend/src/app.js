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
import { publicRouter } from "./routes/public.routes.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

export const app = express();

// api só é alcançável pelo nginx do próprio container "app" — confiar na
// cadeia de X-Forwarded-For pra usar o IP real do visitante no rate limit.
app.set("trust proxy", true);

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
app.use("/api/public", publicRouter);
app.use("/api/clients", clientsRouter);
app.use("/api/services", servicesRouter);
app.use("/api/appointments", appointmentsRouter);

app.use(notFoundHandler);
app.use(errorHandler);
