import { ambiente } from "../configuracao/ambiente.js";

export const whatsAppHabilitado = Boolean(
  ambiente.WHATSAPP_ACCESS_TOKEN && ambiente.WHATSAPP_PHONE_NUMBER_ID
);

// Normaliza telefones no padrão BR ("(11) 98888-7777") para o formato
// internacional sem símbolos que a Cloud API exige ("5511988887777").
export function normalizarTelefoneWhatsApp(telefoneBruto) {
  const digitos = telefoneBruto.replace(/\D/g, "");
  if (digitos.startsWith(ambiente.WHATSAPP_DEFAULT_COUNTRY_CODE)) return digitos;
  return `${ambiente.WHATSAPP_DEFAULT_COUNTRY_CODE}${digitos}`;
}

async function enviarModelo(telefoneDestino, nomeModelo, parametros) {
  if (!whatsAppHabilitado) {
    console.log(`[whatsapp] desligado — mensagem não enviada (template: ${nomeModelo})`);
    return;
  }

  const url = `https://graph.facebook.com/${ambiente.WHATSAPP_API_VERSION}/${ambiente.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const resposta = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ambiente.WHATSAPP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: normalizarTelefoneWhatsApp(telefoneDestino),
      type: "template",
      template: {
        name: nomeModelo,
        language: { code: ambiente.WHATSAPP_LANGUAGE },
        components: [
          {
            type: "body",
            parameters: parametros.map((texto) => ({ type: "text", text: String(texto) })),
          },
        ],
      },
    }),
  });

  if (!resposta.ok) {
    const corpo = await resposta.text().catch(() => "");
    console.error(`[whatsapp] falha ao enviar (${resposta.status}): ${corpo}`);
  }
}

function formatarDataHora(data) {
  return new Date(data).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export async function enviarConfirmacaoAgendamento(agendamento) {
  if (!agendamento.cliente.telefone) return;
  await enviarModelo(agendamento.cliente.telefone, ambiente.WHATSAPP_TEMPLATE_CONFIRMATION, [
    agendamento.cliente.nome,
    agendamento.servico.nome,
    formatarDataHora(agendamento.data),
  ]).catch((err) => console.error("[whatsapp] erro ao enviar confirmação:", err));
}

export async function enviarCancelamentoAgendamento(agendamento) {
  if (!agendamento.cliente.telefone) return;
  await enviarModelo(agendamento.cliente.telefone, ambiente.WHATSAPP_TEMPLATE_CANCELLATION, [
    agendamento.cliente.nome,
    agendamento.servico.nome,
    formatarDataHora(agendamento.data),
  ]).catch((err) => console.error("[whatsapp] erro ao enviar cancelamento:", err));
}

export async function enviarLembreteAgendamento(agendamento) {
  if (!agendamento.cliente.telefone) return;
  await enviarModelo(agendamento.cliente.telefone, ambiente.WHATSAPP_TEMPLATE_REMINDER, [
    agendamento.cliente.nome,
    agendamento.servico.nome,
    formatarDataHora(agendamento.data),
  ]).catch((err) => console.error("[whatsapp] erro ao enviar lembrete:", err));
}
