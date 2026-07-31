import { prisma } from "./prisma.js";
import { ambiente } from "../configuracao/ambiente.js";
import { whatsAppHabilitado, enviarLembreteAgendamento } from "./whatsapp.js";

const INTERVALO_VERIFICACAO_MS = 10 * 60 * 1000; // 10 minutos

async function verificarEEnviarLembretes() {
  const fimJanela = new Date(Date.now() + ambiente.WHATSAPP_REMINDER_HOURS_BEFORE * 60 * 60 * 1000);

  const agendamentosPendentes = await prisma.agendamento.findMany({
    where: {
      status: { in: ["AGENDADO", "CONFIRMADO"] },
      lembreteEnviadoEm: null,
      data: { gte: new Date(), lte: fimJanela },
    },
    include: { cliente: true, servico: true },
  });

  for (const agendamento of agendamentosPendentes) {
    await enviarLembreteAgendamento(agendamento);
    await prisma.agendamento.update({
      where: { id: agendamento.id },
      data: { lembreteEnviadoEm: new Date() },
    });
  }

  if (agendamentosPendentes.length > 0) {
    console.log(`[whatsapp] lembretes enviados: ${agendamentosPendentes.length}`);
  }
}

export function iniciarTarefaLembrete() {
  if (!whatsAppHabilitado) return;
  verificarEEnviarLembretes().catch((err) => console.error("[whatsapp] erro no job de lembrete:", err));
  setInterval(() => {
    verificarEEnviarLembretes().catch((err) => console.error("[whatsapp] erro no job de lembrete:", err));
  }, INTERVALO_VERIFICACAO_MS);
}
