import "dotenv/config";
import { z } from "zod";

// Nomes de variável de ambiente ficam em inglês por convenção técnica (são
// chaves de configuração/infraestrutura já usadas no .env e no deploy do
// VPS, não identificadores de código de negócio).
const esquema = z
  .object({
    DATABASE_URL: z.string().min(1),
    JWT_SECRET: z.string().min(32),
    PORT: z.coerce.number().default(4000),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    COOKIE_NAME: z.string().default("salao_session"),
    // z.coerce.boolean() faria Boolean("false") => true (qualquer string não
    // vazia é "truthy" em JS) — por isso comparamos o texto explicitamente.
    COOKIE_SECURE: z
      .enum(["true", "false"])
      .default("false")
      .transform((v) => v === "true"),
    CORS_ORIGIN: z.string().min(1),

    // Adaptador de cobrança (Fase 11) — "manual" é o único que existe hoje
    // (Mestre gerencia a Assinatura na mão). Plugar Stripe/Mercado
    // Pago/Pagar.me é implementar a mesma interface em
    // servicos/cobranca.servico.js e apontar essa variável pra ele.
    GATEWAY_COBRANCA: z.enum(["manual"]).default("manual"),

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
  })
  .refine((dados) => dados.NODE_ENV !== "production" || dados.COOKIE_SECURE, {
    message: "COOKIE_SECURE precisa ser true quando NODE_ENV=production (cookie de sessão só por HTTPS).",
    path: ["COOKIE_SECURE"],
  });

export const ambiente = esquema.parse(process.env);
