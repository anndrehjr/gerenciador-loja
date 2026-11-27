import { prisma } from "../biblioteca/prisma.js";
import { ErroHttp } from "../middleware/tratadorErros.js";

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

// Limites são definidos pelo Mestre por plano (Plano.limites, JSON livre —
// ver planos.controlador.js), mas até 2026-07-31 nunca eram checados contra
// o uso real (achado da auditoria: "Planos.jsx edita, mas nada aplica").
// Ausência de Assinatura/Plano/campo = sem limite, mesmo espírito não
// retroativo de assinaturaEstaBloqueada.
export async function obterLimitesDoPlano(salaoId) {
  const assinatura = await prisma.assinatura.findUnique({ where: { salaoId }, include: { plano: true } });
  return assinatura?.plano?.limites || {};
}

export async function garantirLimiteDeProfissionais(salaoId) {
  const { maxProfissionais } = await obterLimitesDoPlano(salaoId);
  if (maxProfissionais == null) return;
  const total = await prisma.profissional.count({ where: { salaoId, deletadoEm: null } });
  if (total >= maxProfissionais) {
    throw new ErroHttp(
      402,
      `Seu plano permite até ${maxProfissionais} profissional(is). Fale com a gente pra aumentar o limite.`
    );
  }
}

// Conta por criadoEm (quando o agendamento foi feito), não pela data marcada
// — é uso do mês corrente, o mesmo espírito de um limite de cota de SaaS.
export async function garantirLimiteDeAgendamentosDoMes(salaoId) {
  const { maxAgendamentosMes } = await obterLimitesDoPlano(salaoId);
  if (maxAgendamentosMes == null) return;

  const inicioDoMes = new Date();
  inicioDoMes.setDate(1);
  inicioDoMes.setHours(0, 0, 0, 0);
  const inicioDoProximoMes = new Date(inicioDoMes);
  inicioDoProximoMes.setMonth(inicioDoProximoMes.getMonth() + 1);

  const total = await prisma.agendamento.count({
    where: { salaoId, deletadoEm: null, criadoEm: { gte: inicioDoMes, lt: inicioDoProximoMes } },
  });
  if (total >= maxAgendamentosMes) {
    throw new ErroHttp(
      402,
      `Seu plano permite até ${maxAgendamentosMes} agendamento(s) por mês. Fale com a gente pra aumentar o limite.`
    );
  }
}
