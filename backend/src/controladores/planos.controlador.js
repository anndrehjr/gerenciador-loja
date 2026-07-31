import { z } from "zod";
import { prisma } from "../biblioteca/prisma.js";
import { ErroHttp } from "../middleware/tratadorErros.js";
import { registrarAuditoria } from "../servicos/auditoria.servico.js";

// Só edita os 3 planos já seedados na migration (START/PRO/PREMIUM) — a
// chave é vocabulário fixo, usado em biblioteca/planos.js e no schema do
// salão, então esse endpoint nunca cria/apaga plano, só ajusta comercial.
const esquemaAtualizarPlano = z.object({
  nome: z.string().min(1).optional(),
  precoCentavos: z.number().int().min(0).optional(),
  ativo: z.boolean().optional(),
  limites: z
    .object({
      maxProfissionais: z.number().int().min(0).nullable().optional(),
      maxAgendamentosMes: z.number().int().min(0).nullable().optional(),
    })
    .nullable()
    .optional(),
});

const ORDEM_CHAVE = { START: 0, PRO: 1, PREMIUM: 2 };

export async function listarPlanos(req, res) {
  const planos = await prisma.plano.findMany();
  planos.sort((a, b) => (ORDEM_CHAVE[a.chave] ?? 99) - (ORDEM_CHAVE[b.chave] ?? 99));
  res.json(planos);
}

export async function atualizarPlano(req, res) {
  const dados = esquemaAtualizarPlano.parse(req.body);

  const plano = await prisma.plano
    .update({ where: { id: req.params.id }, data: dados })
    .catch((err) => {
      if (err.code === "P2025") throw new ErroHttp(404, "Plano não encontrado.");
      throw err;
    });

  registrarAuditoria({
    usuarioId: req.usuario.sub,
    acao: "plano.atualizar",
    entidade: "Plano",
    entidadeId: plano.id,
    ip: req.ip,
  }).catch(() => {});

  res.json(plano);
}
