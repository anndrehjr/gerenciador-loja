import { prisma } from "../biblioteca/prisma.js";

// Busca o MembroEquipe do usuário no próprio salão (define o papel granular
// usado por verificarPermissao). Usuários MESTRE nunca têm um — não operam
// dentro de um salão específico.
//
// Autocura defensiva: um ADMINISTRADOR com salão mas sem MembroEquipe (não
// deveria acontecer — a migration faz backfill de todo mundo pra DONO, e
// criarSalao/criarConta sempre criam os dois juntos na mesma transação) vira
// DONO automaticamente. Nunca autocura pra um papel mais permissivo que
// DONO, então não é um jeito de "recuperar" acesso perdido por alguém que
// foi removido da equipe — remover a equipe apaga o Usuario inteiro
// (ver removerMembroEquipe), não deixa esse estado inconsistente existir.
export async function resolverMembroEquipe(usuario) {
  if (usuario.papel === "MESTRE" || !usuario.salaoId) return null;

  const existente = await prisma.membroEquipe.findUnique({
    where: { usuarioId_salaoId: { usuarioId: usuario.id, salaoId: usuario.salaoId } },
  });
  if (existente) return existente;

  return prisma.membroEquipe.create({
    data: { usuarioId: usuario.id, salaoId: usuario.salaoId, papel: "DONO" },
  });
}

export async function listarEquipe(salaoId) {
  return prisma.membroEquipe.findMany({
    where: { salaoId },
    include: {
      usuario: { select: { id: true, nome: true, email: true } },
      profissional: { select: { id: true, nome: true } },
    },
    orderBy: { criadoEm: "asc" },
  });
}

export async function convidarMembroEquipe({ salaoId, nome, email, senhaHash, papel, profissionalId }) {
  return prisma.$transaction(async (tx) => {
    const usuario = await tx.usuario.create({
      data: { nome, email, senhaHash, papel: "ADMINISTRADOR", salaoId },
    });
    const membro = await tx.membroEquipe.create({
      data: { usuarioId: usuario.id, salaoId, papel, profissionalId: profissionalId || null },
      include: {
        usuario: { select: { id: true, nome: true, email: true } },
        profissional: { select: { id: true, nome: true } },
      },
    });
    return membro;
  });
}

export async function obterMembro(salaoId, membroId) {
  return prisma.membroEquipe.findFirst({ where: { id: membroId, salaoId } });
}

export async function atualizarPapelMembro(salaoId, membroId, { papel, profissionalId }) {
  const membro = await prisma.membroEquipe.findFirst({ where: { id: membroId, salaoId } });
  if (!membro) return null;
  return prisma.membroEquipe.update({
    where: { id: membro.id },
    data: { papel, profissionalId: profissionalId === undefined ? membro.profissionalId : profissionalId },
    include: {
      usuario: { select: { id: true, nome: true, email: true } },
      profissional: { select: { id: true, nome: true } },
    },
  });
}

// Remove o acesso por completo — apaga o Usuario (cascade apaga o
// MembroEquipe junto), não só o vínculo. Deixar o Usuario vivo sem
// MembroEquipe reabriria a autocura defensiva de resolverMembroEquipe pra
// DONO no próximo login, o que reverteria a remoção sozinho.
export async function removerMembroEquipe(salaoId, membroId) {
  const membro = await prisma.membroEquipe.findFirst({ where: { id: membroId, salaoId } });
  if (!membro) return false;
  await prisma.usuario.delete({ where: { id: membro.usuarioId } });
  return true;
}
