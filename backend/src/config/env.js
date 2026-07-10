import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  COOKIE_NAME: z.string().default("salao_session"),
  COOKIE_SECURE: z.coerce.boolean().default(false),
  CORS_ORIGIN: z.string().min(1),

  // WhatsApp Cloud API (oficial, Meta) — opcional. Sem essas duas variáveis,
  // as notificações ficam desligadas e o resto do sistema funciona normalmente.
  WHATSAPP_ACCESS_TOKEN: z.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_API_VERSION: z.string().default("v20.0"),
  WHATSAPP_LANGUAGE: z.string().default("pt_BR"),
  WHATSAPP_TEMPLATE_CONFIRMATION: z.string().default("agendamento_confirmacao"),
  WHATSAPP_TEMPLATE_REMINDER: z.string().default("agendamento_lembrete"),
  WHATSAPP_TEMPLATE_CANCELLATION: z.string().default("agendamento_cancelamento"),
  WHATSAPP_REMINDER_HOURS_BEFORE: z.coerce.number().default(24),
  WHATSAPP_DEFAULT_COUNTRY_CODE: z.string().default("55"),
});

export const env = schema.parse(process.env);
