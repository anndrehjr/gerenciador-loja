import { z } from "zod";
import { prisma } from "../biblioteca/prisma.js";
import { ErroHttp } from "../middleware/tratadorErros.js";
import { parsePaginacao, definirCabecalhoTotal } from "../biblioteca/paginacao.js";

const esquemaServico = z.object({
  nome: z.string().min(1),
  descricao: z.string().optional().nullable(),
  precoCentavos: z.number().int().nonnegative(),
  duracaoMinutos: z.number().int().positive().optional(),
  ativo: z.boolean().optional(),
  // Sem essa chave = não mexe nos vínculos. Array vazio = desvincula todo
  // mundo (o serviço volta a aceitar qualquer profissional do salão).
  profissionalIds: z.array(z.string()).optional(),
});

const SELECT_PROFISSIONAL = { id: true, nome: true, urlFoto: true, especialidade: true };

const comProfissionais = {
  profissionais: { include: { profissional: { select: SELECT_PROFISSIONAL } } },
};

function achatarProfissionais(servico) {
  if (!servico) return servico;
  const { profissionais, ...resto } = servico;
  return { ...resto, profissionais: profissionais.map((p) => p.profissional) };
}

// Confere que cada id de profissional realmente pertence a esse salão antes
// de vincular — sem isso, um admin poderia vincular (e vazar a existência
// de) um profissional de outro salão só adivinhando o id.
async function garantirProfissionaisDoSalao(profissionalIds, salaoId) {
  if (!profissionalIds.length) return;
  const total = await prisma.profissional.count({ where: { id: { in: profissionalIds }, salaoId } });
  if (total !== profissionalIds.length) {
    throw new ErroHttp(400, "Um ou mais profissionais informados não pertencem a este salão.");
  }
}

async function definirProfissionaisDoServico(servicoId, profissionalIds, salaoId) {
  await garantirProfissionaisDoSalao(profissionalIds, salaoId);
  await prisma.$transaction([
    prisma.servicoProfissional.deleteMany({ where: { servicoId } }),
    ...(profissionalIds.length
      ? [
          prisma.servicoProfissional.createMany({
            data: profissionalIds.map((profissionalId) => ({ servicoId, profissionalId, salaoId })),
          }),
        ]
      : []),
  ]);
}

export async function listarServicos(req, res) {
  const somenteAtivos = req.query.active === "true";
  const { skip, take } = parsePaginacao(req.query);
  const where = { salaoId: req.salaoId, deletadoEm: null, ...(somenteAtivos ? { ativo: true } : {}) };

  const [servicos, total] = await Promise.all([
    prisma.servico.findMany({ where, orderBy: { nome: "asc" }, include: comProfissionais, skip, take }),
    prisma.servico.count({ where }),
  ]);
  definirCabecalhoTotal(res, total);
  res.json(servicos.map(achatarProfissionais));
}

export async function obterServico(req, res) {
  const servico = await prisma.servico.findFirst({
    where: { id: req.params.id, salaoId: req.salaoId, deletadoEm: null },
    include: comProfissionais,
  });
  if (!servico) throw new ErroHttp(404, "Serviço não encontrado.");
  res.json(achatarProfissionais(servico));
}

export async function criarServico(req, res) {
  const { profissionalIds, ...dados } = esquemaServico.parse(req.body);
  const servico = await prisma.servico.create({ data: { ...dados, salaoId: req.salaoId } });

  if (profissionalIds) {
    await definirProfissionaisDoServico(servico.id, profissionalIds, req.salaoId);
  }

  const completo = await prisma.servico.findUnique({ where: { id: servico.id }, include: comProfissionais });
  res.status(201).json(achatarProfissionais(completo));
}

export async function atualizarServico(req, res) {
  const { profissionalIds, ...dados } = esquemaServico.partial().parse(req.body);

  const existente = await prisma.servico.findFirst({
    where: { id: req.params.id, salaoId: req.salaoId, deletadoEm: null },
  });
  if (!existente) throw new ErroHttp(404, "Serviço não encontrado.");

  await prisma.servico.update({ where: { id: existente.id }, data: dados });

  if (profissionalIds !== undefined) {
    await definirProfissionaisDoServico(existente.id, profissionalIds, req.salaoId);
  }

  const completo = await prisma.servico.findUnique({ where: { id: existente.id }, include: comProfissionais });
  res.json(achatarProfissionais(completo));
}

export async function excluirServico(req, res) {
  const existente = await prisma.servico.findFirst({
    where: { id: req.params.id, salaoId: req.salaoId, deletadoEm: null },
  });
  if (!existente) throw new ErroHttp(404, "Serviço não encontrado.");

  await prisma.servico.update({ where: { id: existente.id }, data: { deletadoEm: new Date() } });
  res.status(204).send();
}
