import { prisma } from "../biblioteca/prisma.js";

const DIAS_TESTE_GRATIS = 14;

// Todo salão novo (self-service ou criado pelo Mestre) nasce com uma
// Assinatura em teste grátis de 14 dias. `tx` é o client da transação de
// quem está criando o salão (onboarding.servico.js) — assim salão, dono e
// assinatura nascem atômicos, ou nenhum dos três é criado.
export async function iniciarAssinaturaTeste(tx, salaoId, planoChave = "START") {
  const plano = await tx.plano.findUnique({ where: { chave: planoChave } });
  if (!plano) return null; // planos são seedados na migration; só fica null num banco não migrado

  const agora = new Date();
  const fimTeste = new Date(agora);
  fimTeste.setDate(fimTeste.getDate() + DIAS_TESTE_GRATIS);

  return tx.assinatura.create({
    data: {
      salaoId,
      planoId: plano.id,
      status: "TESTE",
      inicioTeste: agora,
      fimTeste,
      proximaCobranca: fimTeste,
    },
  });
}

// Bloqueio por vencimento (Fase 11) — chamado no login. Sem gateway real
// plugado ainda, "vencer" hoje só quer dizer "o teste grátis acabou e
// ninguém virou a assinatura pra ATIVA manualmente" — é o gancho pronto pra
// quando o adaptador de cobrança (Stripe/Mercado Pago/Pagar.me) passar a
// sincronizar StatusAssinatura de verdade via webhook.
export async function assinaturaEstaBloqueada(salaoId) {
  if (!salaoId) return false;
  const assinatura = await prisma.assinatura.findUnique({ where: { salaoId } });
  if (!assinatura) return false; // salão de antes da Fase 11, sem Assinatura — não trava ninguém retroativamente
  if (assinatura.status === "CANCELADA") return true;
  if (assinatura.status === "ATRASADA") return true;
  if (assinatura.status === "TESTE" && assinatura.fimTeste && assinatura.fimTeste < new Date()) return true;
  return false;
}
