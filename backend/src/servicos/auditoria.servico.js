import { prisma } from "../biblioteca/prisma.js";

// Best-effort de propósito — um log de auditoria que falha não pode derrubar
// a ação real que ele está registrando.
export async function registrarAuditoria({ usuarioId, salaoId, acao, entidade, entidadeId, detalhes, ip }) {
  try {
    await prisma.logAuditoria.create({
      data: {
        usuarioId: usuarioId || null,
        salaoId: salaoId || null,
        acao,
        entidade,
        entidadeId: entidadeId || null,
        detalhes: detalhes || undefined,
        ip: ip || null,
      },
    });
  } catch (err) {
    console.error("[auditoria] falha ao registrar log:", err);
  }
}

// req.ip já respeita "trust proxy" (aplicacao.js) — é o IP real do
// visitante, não o do proxy interno.
export function ipDaRequisicao(req) {
  return req.ip;
}
