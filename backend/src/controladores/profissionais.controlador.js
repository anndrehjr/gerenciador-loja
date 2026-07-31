import { z } from "zod";
import { prisma } from "../biblioteca/prisma.js";
import { ErroHttp } from "../middleware/tratadorErros.js";
import { parsePaginacao, definirCabecalhoTotal } from "../biblioteca/paginacao.js";

const esquemaProfissional = z.object({
  nome: z.string().min(1),
  urlFoto: z
    .string()
    .url()
    .refine((url) => /^https?:\/\//i.test(url), "A URL da foto precisa ser http:// ou https://")
    .optional()
    .nullable(),
  especialidade: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  ativo: z.boolean().optional(),
});

const esquemaHorarioTrabalho = z.object({
  diaSemana: z.number().int().min(0).max(6),
  minutoInicio: z.number().int().min(0).max(1439),
  minutoFim: z.number().int().min(1).max(1440),
});

function temSobreposicaoNoDia(horarios) {
  const porDiaSemana = new Map();
  for (const h of horarios) {
    const lista = porDiaSemana.get(h.diaSemana) || [];
    lista.push(h);
    porDiaSemana.set(h.diaSemana, lista);
  }
  for (const lista of porDiaSemana.values()) {
    const ordenada = [...lista].sort((a, b) => a.minutoInicio - b.minutoInicio);
    for (let i = 1; i < ordenada.length; i++) {
      if (ordenada[i].minutoInicio < ordenada[i - 1].minutoFim) return true;
    }
  }
  return false;
}

// Um dia pode ter mais de uma janela (turno dividido, ex.: manhã e tarde),
// desde que não se sobreponham.
const esquemaHorariosTrabalho = z
  .array(esquemaHorarioTrabalho)
  .refine((horarios) => horarios.every((h) => h.minutoFim > h.minutoInicio), {
    message: "O horário final deve ser depois do horário inicial.",
  })
  .refine((horarios) => !temSobreposicaoNoDia(horarios), {
    message: "As janelas de horário no mesmo dia não podem se sobrepor.",
  });

const esquemaAusencia = z
  .object({
    dataInicio: z.coerce.date(),
    dataFim: z.coerce.date(),
    motivo: z.string().optional().nullable(),
  })
  .refine((d) => d.dataFim >= d.dataInicio, {
    message: "A data final deve ser igual ou depois da data inicial.",
  });

const incluir = {
  horariosTrabalho: { orderBy: { diaSemana: "asc" } },
  ausencias: { orderBy: { dataInicio: "asc" } },
};

export async function listarProfissionais(req, res) {
  const somenteAtivos = req.query.active === "true";
  const { skip, take } = parsePaginacao(req.query);
  const where = { salaoId: req.salaoId, deletadoEm: null, ...(somenteAtivos ? { ativo: true } : {}) };

  const [profissionais, total] = await Promise.all([
    prisma.profissional.findMany({ where, include: incluir, orderBy: { nome: "asc" }, skip, take }),
    prisma.profissional.count({ where }),
  ]);
  definirCabecalhoTotal(res, total);
  res.json(profissionais);
}

export async function obterProfissional(req, res) {
  const profissional = await prisma.profissional.findFirst({
    where: { id: req.params.id, salaoId: req.salaoId, deletadoEm: null },
    include: incluir,
  });
  if (!profissional) throw new ErroHttp(404, "Profissional não encontrado.");
  res.json(profissional);
}

export async function criarProfissional(req, res) {
  const dados = esquemaProfissional.parse(req.body);
  const profissional = await prisma.profissional.create({
    data: { ...dados, salaoId: req.salaoId },
    include: incluir,
  });
  res.status(201).json(profissional);
}

export async function atualizarProfissional(req, res) {
  const dados = esquemaProfissional.partial().parse(req.body);

  const existente = await prisma.profissional.findFirst({
    where: { id: req.params.id, salaoId: req.salaoId, deletadoEm: null },
  });
  if (!existente) throw new ErroHttp(404, "Profissional não encontrado.");

  const profissional = await prisma.profissional.update({
    where: { id: existente.id },
    data: dados,
    include: incluir,
  });
  res.json(profissional);
}

export async function excluirProfissional(req, res) {
  const existente = await prisma.profissional.findFirst({
    where: { id: req.params.id, salaoId: req.salaoId, deletadoEm: null },
  });
  if (!existente) throw new ErroHttp(404, "Profissional não encontrado.");

  await prisma.profissional.update({ where: { id: existente.id }, data: { deletadoEm: new Date() } });
  res.status(204).send();
}

export async function substituirHorariosTrabalho(req, res) {
  const horarios = esquemaHorariosTrabalho.parse(req.body);

  const profissional = await prisma.profissional.findFirst({
    where: { id: req.params.id, salaoId: req.salaoId, deletadoEm: null },
  });
  if (!profissional) throw new ErroHttp(404, "Profissional não encontrado.");

  await prisma.$transaction([
    prisma.horarioTrabalho.deleteMany({ where: { profissionalId: profissional.id } }),
    prisma.horarioTrabalho.createMany({
      data: horarios.map((h) => ({ ...h, profissionalId: profissional.id, salaoId: req.salaoId })),
    }),
  ]);

  const atualizado = await prisma.profissional.findUnique({ where: { id: profissional.id }, include: incluir });
  res.json(atualizado);
}

export async function criarAusencia(req, res) {
  const dados = esquemaAusencia.parse(req.body);

  const profissional = await prisma.profissional.findFirst({
    where: { id: req.params.id, salaoId: req.salaoId, deletadoEm: null },
  });
  if (!profissional) throw new ErroHttp(404, "Profissional não encontrado.");

  const ausencia = await prisma.ausencia.create({
    data: { ...dados, profissionalId: profissional.id, salaoId: req.salaoId },
  });
  res.status(201).json(ausencia);
}

export async function excluirAusencia(req, res) {
  const existente = await prisma.ausencia.findFirst({
    where: { id: req.params.ausenciaId, salaoId: req.salaoId, profissionalId: req.params.id },
  });
  if (!existente) throw new ErroHttp(404, "Registro não encontrado.");

  await prisma.ausencia.delete({ where: { id: existente.id } });
  res.status(204).send();
}
