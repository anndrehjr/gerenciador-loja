import { z } from "zod";
import { prisma } from "../biblioteca/prisma.js";
import { ErroHttp } from "../middleware/tratadorErros.js";

export async function listarNotificacoes(req, res) {
  const notificacoes = await prisma.notificacao.findMany({
    where: { salaoId: req.salaoId },
    orderBy: { criadoEm: "desc" },
    take: 50,
  });
  res.json(notificacoes);
}

export async function contarNaoLidas(req, res) {
  const total = await prisma.notificacao.count({ where: { salaoId: req.salaoId, lida: false } });
  res.json({ total });
}

const esquemaMarcarLida = z.object({ lida: z.boolean() });

export async function marcarComoLida(req, res) {
  const { lida } = esquemaMarcarLida.parse(req.body);
  const existente = await prisma.notificacao.findFirst({ where: { id: req.params.id, salaoId: req.salaoId } });
  if (!existente) throw new ErroHttp(404, "Notificação não encontrada.");
  const notificacao = await prisma.notificacao.update({ where: { id: existente.id }, data: { lida } });
  res.json(notificacao);
}

export async function marcarTodasComoLidas(req, res) {
  await prisma.notificacao.updateMany({ where: { salaoId: req.salaoId, lida: false }, data: { lida: true } });
  res.status(204).send();
}
