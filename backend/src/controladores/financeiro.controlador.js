import { z } from "zod";
import { prisma } from "../biblioteca/prisma.js";
import { ErroHttp } from "../middleware/tratadorErros.js";

const METODOS = ["DINHEIRO", "PIX", "CARTAO"];
const CATEGORIAS_DESPESA = ["ALUGUEL", "FOLHA_PAGAMENTO", "PRODUTOS", "MARKETING", "MANUTENCAO", "OUTROS"];

const esquemaDespesa = z.object({
  descricao: z.string().min(1),
  categoria: z.enum(CATEGORIAS_DESPESA),
  valorCentavos: z.number().int().positive(),
  data: z.coerce.date(),
});

const esquemaPagamento = z.object({
  agendamentoId: z.string().min(1),
  valorCentavos: z.number().int().positive(),
  metodo: z.enum(METODOS),
  // Opcional — só cria Comissao se vier preenchido. Percentual e não um
  // valor fixo no cadastro do profissional de propósito: mudar o padrão no
  // futuro não deve reescrever comissões já fechadas (ver comentário no
  // schema, model Comissao).
  percentualComissao: z.number().min(0).max(100).optional(),
});

const incluirPagamento = {
  agendamento: { include: { cliente: true, servico: true, profissional: true } },
  comissao: true,
};

export async function listarPagamentos(req, res) {
  const { de, ate } = req.query;
  const pagamentos = await prisma.pagamento.findMany({
    where: {
      salaoId: req.salaoId,
      ...(de || ate
        ? {
            pagoEm: {
              ...(de ? { gte: new Date(de) } : {}),
              ...(ate ? { lte: new Date(ate) } : {}),
            },
          }
        : {}),
    },
    include: incluirPagamento,
    orderBy: { pagoEm: "desc" },
    take: 100,
  });
  res.json(pagamentos);
}

export async function registrarPagamento(req, res) {
  const dados = esquemaPagamento.parse(req.body);

  const agendamento = await prisma.agendamento.findFirst({
    where: { id: dados.agendamentoId, salaoId: req.salaoId, deletadoEm: null },
  });
  if (!agendamento) throw new ErroHttp(404, "Agendamento não encontrado.");

  const pagamento = await prisma
    .$transaction(async (tx) => {
      const criado = await tx.pagamento.create({
        data: {
          agendamentoId: agendamento.id,
          valorCentavos: dados.valorCentavos,
          metodo: dados.metodo,
          salaoId: req.salaoId,
        },
      });

      if (dados.percentualComissao && agendamento.profissionalId) {
        const valorComissao = Math.round((dados.valorCentavos * dados.percentualComissao) / 100);
        await tx.comissao.create({
          data: {
            profissionalId: agendamento.profissionalId,
            pagamentoId: criado.id,
            percentual: dados.percentualComissao,
            valorCentavos: valorComissao,
            salaoId: req.salaoId,
          },
        });
      }

      return tx.pagamento.findUnique({ where: { id: criado.id }, include: incluirPagamento });
    })
    .catch((err) => {
      if (err.code === "P2002") throw new ErroHttp(409, "Esse agendamento já tem um pagamento registrado.");
      throw err;
    });

  res.status(201).json(pagamento);
}

export async function listarDespesas(req, res) {
  const { de, ate } = req.query;
  const despesas = await prisma.despesa.findMany({
    where: {
      salaoId: req.salaoId,
      ...(de || ate ? { data: { ...(de ? { gte: new Date(de) } : {}), ...(ate ? { lte: new Date(ate) } : {}) } } : {}),
    },
    orderBy: { data: "desc" },
    take: 100,
  });
  res.json(despesas);
}

export async function registrarDespesa(req, res) {
  const dados = esquemaDespesa.parse(req.body);
  const despesa = await prisma.despesa.create({ data: { ...dados, salaoId: req.salaoId } });
  res.status(201).json(despesa);
}

function inicioDoDia(data) {
  const d = new Date(data);
  d.setHours(0, 0, 0, 0);
  return d;
}

function inicioDoMes(data) {
  return new Date(data.getFullYear(), data.getMonth(), 1);
}

// Dashboard financeiro (Fase 9): faturamento de hoje/mês, ticket médio do
// mês e o serviço que mais gerou pagamentos no mês — tudo calculado em cima
// de Pagamento, não do preço de tabela do Servico, porque preço de tabela
// pode ter mudado desde então (o valor pago é o que aconteceu de verdade).
export async function obterResumoFinanceiro(req, res) {
  const agora = new Date();
  const inicioHoje = inicioDoDia(agora);
  const fimHoje = new Date(inicioHoje);
  fimHoje.setDate(fimHoje.getDate() + 1);
  const inicioMes = inicioDoMes(agora);

  const [pagamentosHoje, pagamentosMes, despesasMes] = await Promise.all([
    prisma.pagamento.findMany({
      where: { salaoId: req.salaoId, pagoEm: { gte: inicioHoje, lt: fimHoje } },
      select: { valorCentavos: true },
    }),
    prisma.pagamento.findMany({
      where: { salaoId: req.salaoId, pagoEm: { gte: inicioMes } },
      include: { agendamento: { select: { servico: { select: { id: true, nome: true } } } } },
    }),
    prisma.despesa.findMany({ where: { salaoId: req.salaoId, data: { gte: inicioMes } }, select: { valorCentavos: true } }),
  ]);

  const faturamentoHojeCentavos = pagamentosHoje.reduce((soma, p) => soma + p.valorCentavos, 0);
  const faturamentoMesCentavos = pagamentosMes.reduce((soma, p) => soma + p.valorCentavos, 0);
  const despesasMesCentavos = despesasMes.reduce((soma, d) => soma + d.valorCentavos, 0);
  const ticketMedioCentavos = pagamentosMes.length ? Math.round(faturamentoMesCentavos / pagamentosMes.length) : 0;

  const porServico = new Map();
  for (const p of pagamentosMes) {
    const servico = p.agendamento?.servico;
    if (!servico) continue;
    const atual = porServico.get(servico.id) || { nome: servico.nome, total: 0 };
    atual.total += 1;
    porServico.set(servico.id, atual);
  }
  const servicoMaisVendido = [...porServico.values()].sort((a, b) => b.total - a.total)[0] || null;

  res.json({
    faturamentoHojeCentavos,
    faturamentoMesCentavos,
    despesasMesCentavos,
    lucroMesCentavos: faturamentoMesCentavos - despesasMesCentavos,
    ticketMedioCentavos,
    quantidadePagamentosMes: pagamentosMes.length,
    servicoMaisVendido,
  });
}
