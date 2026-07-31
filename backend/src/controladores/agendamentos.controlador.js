import { z } from "zod";
import { prisma } from "../biblioteca/prisma.js";
import { ErroHttp } from "../middleware/tratadorErros.js";
import { enviarConfirmacaoAgendamento, enviarCancelamentoAgendamento } from "../biblioteca/whatsapp.js";
import { parsePaginacao, definirCabecalhoTotal } from "../biblioteca/paginacao.js";

const VALORES_STATUS = ["AGENDADO", "CONFIRMADO", "EM_ATENDIMENTO", "CONCLUIDO", "CANCELADO"];

const esquemaAgendamento = z.object({
  clienteId: z.string().min(1),
  servicoId: z.string().min(1),
  profissionalId: z.string().min(1).optional().nullable(),
  data: z.coerce.date(),
  status: z.enum(VALORES_STATUS).optional(),
  observacoes: z.string().optional().nullable(),
});

const incluir = { cliente: true, servico: true, profissional: true };

// Confere que cliente/serviço/profissional citados no payload pertencem ao
// mesmo salão do usuário logado — sem isso, um admin poderia (por acidente ou
// não) criar um agendamento apontando pra um cliente de outro salão.
async function garantirPertenceAoSalaoAtual(salaoId, { clienteId, servicoId, profissionalId }) {
  const verificacoes = [prisma.cliente.findFirst({ where: { id: clienteId, salaoId, deletadoEm: null } })];
  verificacoes.push(prisma.servico.findFirst({ where: { id: servicoId, salaoId, deletadoEm: null } }));
  if (profissionalId) {
    verificacoes.push(prisma.profissional.findFirst({ where: { id: profissionalId, salaoId, deletadoEm: null } }));
  }
  const resultados = await Promise.all(verificacoes);
  if (resultados.some((r) => !r)) {
    throw new ErroHttp(400, "Cliente, serviço ou profissional inválido.");
  }
}

// PROFISSIONAL só vê a própria agenda (Fase 5) — filtro forçado no servidor,
// nunca opcional: mesmo que o front mande outro profissionalId na query,
// esse filtro prevalece por vir depois no spread.
function comEscopoDoPapel(req) {
  if (req.papelEquipe === "PROFISSIONAL" && req.profissionalId) {
    return { profissionalId: req.profissionalId };
  }
  return {};
}

export async function listarAgendamentos(req, res) {
  const { clienteId, servicoId, status, de, ate } = req.query;

  const where = {
    salaoId: req.salaoId,
    deletadoEm: null,
    ...(clienteId ? { clienteId } : {}),
    ...(servicoId ? { servicoId } : {}),
    ...(status ? { status } : {}),
    ...(de || ate
      ? {
          data: {
            ...(de ? { gte: new Date(de) } : {}),
            ...(ate ? { lte: new Date(ate) } : {}),
          },
        }
      : {}),
    ...comEscopoDoPapel(req),
  };

  const { skip, take } = parsePaginacao(req.query);
  const [agendamentos, total] = await Promise.all([
    prisma.agendamento.findMany({ where, include: incluir, orderBy: { data: "desc" }, skip, take }),
    prisma.agendamento.count({ where }),
  ]);
  definirCabecalhoTotal(res, total);
  res.json(agendamentos);
}

export async function obterAgendamento(req, res) {
  const agendamento = await prisma.agendamento.findFirst({
    where: { id: req.params.id, salaoId: req.salaoId, deletadoEm: null, ...comEscopoDoPapel(req) },
    include: incluir,
  });
  if (!agendamento) throw new ErroHttp(404, "Agendamento não encontrado.");
  res.json(agendamento);
}

export async function criarAgendamento(req, res) {
  const dados = esquemaAgendamento.parse(req.body);
  await garantirPertenceAoSalaoAtual(req.salaoId, dados);

  const agendamento = await prisma.agendamento.create({
    data: { ...dados, salaoId: req.salaoId },
    include: incluir,
  });
  res.status(201).json(agendamento);
  enviarConfirmacaoAgendamento(agendamento).catch(() => {});
}

export async function atualizarAgendamento(req, res) {
  const dados = esquemaAgendamento.partial().parse(req.body);

  const antes = await prisma.agendamento.findFirst({
    where: { id: req.params.id, salaoId: req.salaoId, deletadoEm: null, ...comEscopoDoPapel(req) },
  });
  if (!antes) throw new ErroHttp(404, "Agendamento não encontrado.");

  if (dados.clienteId || dados.servicoId || dados.profissionalId) {
    await garantirPertenceAoSalaoAtual(req.salaoId, {
      clienteId: dados.clienteId || antes.clienteId,
      servicoId: dados.servicoId || antes.servicoId,
      profissionalId: dados.profissionalId !== undefined ? dados.profissionalId : antes.profissionalId,
    });
  }

  const agendamento = await prisma.agendamento.update({
    where: { id: antes.id },
    data: dados,
    include: incluir,
  });
  res.json(agendamento);

  if (dados.status === "CANCELADO" && antes.status !== "CANCELADO") {
    enviarCancelamentoAgendamento(agendamento).catch(() => {});
  }
}

export async function excluirAgendamento(req, res) {
  const existente = await prisma.agendamento.findFirst({
    where: { id: req.params.id, salaoId: req.salaoId, deletadoEm: null, ...comEscopoDoPapel(req) },
  });
  if (!existente) throw new ErroHttp(404, "Agendamento não encontrado.");

  await prisma.agendamento.update({ where: { id: existente.id }, data: { deletadoEm: new Date() } });
  res.status(204).send();
}
