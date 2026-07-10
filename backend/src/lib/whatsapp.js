import { env } from "../config/env.js";

export const isWhatsAppEnabled = Boolean(
  env.WHATSAPP_ACCESS_TOKEN && env.WHATSAPP_PHONE_NUMBER_ID
);

// Normaliza telefones no padrão BR ("(11) 98888-7777") para o formato
// internacional sem símbolos que a Cloud API exige ("5511988887777").
export function normalizePhone(rawPhone) {
  const digits = rawPhone.replace(/\D/g, "");
  if (digits.startsWith(env.WHATSAPP_DEFAULT_COUNTRY_CODE)) return digits;
  return `${env.WHATSAPP_DEFAULT_COUNTRY_CODE}${digits}`;
}

async function sendTemplate(toPhone, templateName, params) {
  if (!isWhatsAppEnabled) {
    console.log(`[whatsapp] desligado — mensagem não enviada (template: ${templateName})`);
    return;
  }

  const url = `https://graph.facebook.com/${env.WHATSAPP_API_VERSION}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: normalizePhone(toPhone),
      type: "template",
      template: {
        name: templateName,
        language: { code: env.WHATSAPP_LANGUAGE },
        components: [
          {
            type: "body",
            parameters: params.map((text) => ({ type: "text", text: String(text) })),
          },
        ],
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[whatsapp] falha ao enviar (${res.status}): ${body}`);
  }
}

function formatDateTime(date) {
  return new Date(date).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export async function sendAppointmentConfirmation(appointment) {
  if (!appointment.client.phone) return;
  await sendTemplate(appointment.client.phone, env.WHATSAPP_TEMPLATE_CONFIRMATION, [
    appointment.client.name,
    appointment.service.name,
    formatDateTime(appointment.date),
  ]).catch((err) => console.error("[whatsapp] erro ao enviar confirmação:", err));
}

export async function sendAppointmentCancellation(appointment) {
  if (!appointment.client.phone) return;
  await sendTemplate(appointment.client.phone, env.WHATSAPP_TEMPLATE_CANCELLATION, [
    appointment.client.name,
    appointment.service.name,
    formatDateTime(appointment.date),
  ]).catch((err) => console.error("[whatsapp] erro ao enviar cancelamento:", err));
}

export async function sendAppointmentReminder(appointment) {
  if (!appointment.client.phone) return;
  await sendTemplate(appointment.client.phone, env.WHATSAPP_TEMPLATE_REMINDER, [
    appointment.client.name,
    appointment.service.name,
    formatDateTime(appointment.date),
  ]).catch((err) => console.error("[whatsapp] erro ao enviar lembrete:", err));
}
