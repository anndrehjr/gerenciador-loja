import { z } from "zod";
import { prisma } from "../biblioteca/prisma.js";
import { ErroHttp } from "../middleware/tratadorErros.js";
import { normalizarTelefone } from "../utilitarios/telefone.js";
import { parsePaginacao, definirCabecalhoTotal } from "../biblioteca/paginacao.js";

const esquemaCliente = z.object({
  nome: z.string().min(1),
  email: z.string().email().optional().nullable(),
  telefone: z
    .string()
    .transform((v) => normalizarTelefone(v) || null)
    .optional()
    .nullable(),
  dataNascimento: z.coerce.date().optional().nullable(),
  vip: z.boolean().optional(),
  observacoes: z.string().optional().nullable(),
});

// PROFISSIONAL só vê clientes que já atendeu (Fase 5) — aplicado aqui, não só
// escondido na tela, porque é o controlador que decide o que é seguro
// devolver, nunca o frontend. RECEPCIONISTA/GERENTE/DONO veem todo mundo.
function comEscopoDoPapel(req) {
  if (req.papelEquipe === "PROFISSIONAL" && req.profissionalId) {
    return { agendamentos: { some: { profissionalId: req.profissionalId } } };
  }
  return {};
}

export async function listarClientes(req, res) {
  const { skip, take } = parsePaginacao(req.query);
  const where = { salaoId: req.salaoId, deletadoEm: null, ...comEscopoDoPapel(req) };

  const [clientes, total] = await Promise.all([
    prisma.cliente.findMany({ where, orderBy: { nome: "asc" }, skip, take }),
    prisma.cliente.count({ where }),
  ]);
  definirCabecalhoTotal(res, total);
  res.json(clientes);
}

// Traz o histórico junto (Fase 8) — serviços realizados, com quem e quanto
// foi pago de fato (Pagamento, quando existir; sem isso, "gasto total" seria
// só uma estimativa pelo preço de tabela do serviço, que pode ter mudado).
export async function obterCliente(req, res) {
  const cliente = await prisma.cliente.findFirst({
    where: { id: req.params.id, salaoId: req.salaoId, deletadoEm: null, ...comEscopoDoPapel(req) },
    include: {
      agendamentos: {
        where: { deletadoEm: null },
        include: { servico: true, profissional: true, pagamento: true },
        orderBy: { data: "desc" },
      },
    },
  });
  if (!cliente) throw new ErroHttp(404, "Cliente não encontrado.");

  const { agendamentos, ...resto } = cliente;
  const totalGastoCentavos = agendamentos.reduce((soma, a) => soma + (a.pagamento?.valorCentavos || 0), 0);

  res.json({ ...resto, agendamentos, totalGastoCentavos });
}

export async function criarCliente(req, res) {
  const dados = esquemaCliente.parse(req.body);
  const cliente = await prisma.cliente.create({ data: { ...dados, salaoId: req.salaoId } });
  res.status(201).json(cliente);
}

export async function atualizarCliente(req, res) {
  const dados = esquemaCliente.partial().parse(req.body);

  const existente = await prisma.cliente.findFirst({
    where: { id: req.params.id, salaoId: req.salaoId, deletadoEm: null },
  });
  if (!existente) throw new ErroHttp(404, "Cliente não encontrado.");

  const cliente = await prisma.cliente.update({ where: { id: existente.id }, data: dados });
  res.json(cliente);
}

// Soft delete (Fase 12) — mantém o histórico de agendamentos intacto pra
// relatórios/financeiro, só some da lista ativa. Igual antes, respeita
// Agendamento.clienteId onDelete: Restrict continuar nunca sendo violado.
export async function excluirCliente(req, res) {
  const existente = await prisma.cliente.findFirst({
    where: { id: req.params.id, salaoId: req.salaoId, deletadoEm: null },
  });
  if (!existente) throw new ErroHttp(404, "Cliente não encontrado.");

  await prisma.cliente.update({ where: { id: existente.id }, data: { deletadoEm: new Date() } });
  res.status(204).send();
}
