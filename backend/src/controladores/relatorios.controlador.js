import { prisma } from "../biblioteca/prisma.js";

const DIAS_CLIENTE_SUMIU = 60;
const MESES_CRESCIMENTO = 6;

function subtrairDias(data, dias) {
  const d = new Date(data);
  d.setDate(d.getDate() - dias);
  return d;
}

function inicioDoMesOffset(data, offset) {
  return new Date(data.getFullYear(), data.getMonth() - offset, 1);
}

// Visão geral pro painel de Relatórios (Fase 10) — tudo derivado dos dados
// que já existem hoje (Cliente/Agendamento), sem precisar de nenhuma tabela
// nova além do que a Fase 15 já trouxe.
export async function obterRelatorioGeral(req, res) {
  const agora = new Date();
  const limiteSumiu = subtrairDias(agora, DIAS_CLIENTE_SUMIU);
  const inicioMesAtual = inicioDoMesOffset(agora, 0);

  const [clientesNovos, todosClientesComUltimoAgendamento, agendamentosConcluidosMes, profissionais] =
    await Promise.all([
      prisma.cliente.count({
        where: { salaoId: req.salaoId, deletadoEm: null, criadoEm: { gte: inicioMesAtual } },
      }),
      prisma.cliente.findMany({
        where: { salaoId: req.salaoId, deletadoEm: null },
        select: {
          id: true,
          nome: true,
          agendamentos: { select: { data: true }, orderBy: { data: "desc" }, take: 1 },
        },
      }),
      prisma.agendamento.findMany({
        where: {
          salaoId: req.salaoId,
          deletadoEm: null,
          status: "CONCLUIDO",
          data: { gte: inicioMesAtual },
        },
        select: { servico: { select: { id: true, nome: true } }, profissional: { select: { id: true, nome: true } } },
      }),
      prisma.profissional.count({ where: { salaoId: req.salaoId, deletadoEm: null } }),
    ]);

  const clientesPerdidos = todosClientesComUltimoAgendamento.filter((c) => {
    const ultimo = c.agendamentos[0]?.data;
    return ultimo && ultimo < limiteSumiu;
  });

  const porServico = new Map();
  const porProfissional = new Map();
  for (const a of agendamentosConcluidosMes) {
    if (a.servico) {
      const atual = porServico.get(a.servico.id) || { nome: a.servico.nome, total: 0 };
      atual.total += 1;
      porServico.set(a.servico.id, atual);
    }
    if (a.profissional) {
      const atual = porProfissional.get(a.profissional.id) || { nome: a.profissional.nome, total: 0 };
      atual.total += 1;
      porProfissional.set(a.profissional.id, atual);
    }
  }

  const crescimentoMensal = [];
  for (let i = MESES_CRESCIMENTO - 1; i >= 0; i--) {
    const inicio = inicioDoMesOffset(agora, i);
    const fim = inicioDoMesOffset(agora, i - 1);
    const [novosClientes, concluidos] = await Promise.all([
      prisma.cliente.count({ where: { salaoId: req.salaoId, deletadoEm: null, criadoEm: { gte: inicio, lt: fim } } }),
      prisma.agendamento.count({
        where: { salaoId: req.salaoId, deletadoEm: null, status: "CONCLUIDO", data: { gte: inicio, lt: fim } },
      }),
    ]);
    crescimentoMensal.push({
      mes: inicio.toISOString().slice(0, 7),
      novosClientes,
      agendamentosConcluidos: concluidos,
    });
  }

  res.json({
    clientesNovos,
    clientesPerdidos: clientesPerdidos.map((c) => ({ id: c.id, nome: c.nome, ultimoAgendamentoEm: c.agendamentos[0]?.data || null })),
    totalProfissionais: profissionais,
    servicosMaisVendidos: [...porServico.values()].sort((a, b) => b.total - a.total).slice(0, 5),
    profissionaisDestaque: [...porProfissional.values()].sort((a, b) => b.total - a.total).slice(0, 5),
    crescimentoMensal,
  });
}
