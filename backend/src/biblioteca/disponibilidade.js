import { prisma } from "./prisma.js";

const MINUTOS_PASSO_SLOT = 15;

function apenasData(data) {
  const d = new Date(data);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatarData(data) {
  const y = data.getFullYear();
  const m = String(data.getMonth() + 1).padStart(2, "0");
  const d = String(data.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function minutosParaRotulo(minutos) {
  const h = String(Math.floor(minutos / 60)).padStart(2, "0");
  const m = String(minutos % 60).padStart(2, "0");
  return `${h}:${m}`;
}

// --- Funções puras (sem banco), fáceis de testar isoladamente ---

// Dado o(s) período(s) de trabalho de um dia (pode ser mais de um, em caso de
// turno dividido), os intervalos já ocupados e a duração do serviço, devolve
// os horários livres (em "HH:mm") respeitando o grid de 15 em 15 minutos.
export function calcularHorariosLivres({
  janelas,
  intervalosOcupados = [],
  duracaoMinutos,
  minutosPasso = MINUTOS_PASSO_SLOT,
  minutoInicioMinimo = 0,
}) {
  const horarios = new Set();

  for (const janela of janelas) {
    for (
      let minuto = janela.minutoInicio;
      minuto + duracaoMinutos <= janela.minutoFim;
      minuto += minutosPasso
    ) {
      if (minuto < minutoInicioMinimo) continue;

      const fimHorario = minuto + duracaoMinutos;
      const sobrepoeOcupado = intervalosOcupados.some(
        ([inicioOcupado, fimOcupado]) => minuto < fimOcupado && fimHorario > inicioOcupado
      );
      if (!sobrepoeOcupado) horarios.add(minutosParaRotulo(minuto));
    }
  }

  return [...horarios].sort();
}

// Confere se um intervalo [minutoInicio, minutoFim) cabe inteiramente dentro
// de alguma das janelas de trabalho do dia.
export function estaDentroJanelas(minutoInicio, minutoFim, janelas) {
  return janelas.some((j) => minutoInicio >= j.minutoInicio && minutoFim <= j.minutoFim);
}

// --- Funções que consultam o banco (aceitam `clientePrisma` para rodar dentro de uma transação) ---

// Gera, para os próximos `dias` dias, os horários livres de um profissional
// para um serviço (considerando janelas de trabalho — inclusive turno
// dividido —, férias/folgas e agendamentos já existentes).
export async function obterFaixaDisponibilidade({ profissionalId, servicoId, dias = 14 }, clientePrisma = prisma) {
  const servico = await clientePrisma.servico.findUnique({ where: { id: servicoId } });
  if (!servico || !servico.ativo) return null;

  const profissional = await clientePrisma.profissional.findUnique({
    where: { id: profissionalId },
    include: { horariosTrabalho: true, ausencias: true },
  });
  if (!profissional || !profissional.ativo) return null;

  const janelasPorDiaSemana = new Map();
  for (const horario of profissional.horariosTrabalho) {
    const lista = janelasPorDiaSemana.get(horario.diaSemana) || [];
    lista.push({ minutoInicio: horario.minutoInicio, minutoFim: horario.minutoFim });
    janelasPorDiaSemana.set(horario.diaSemana, lista);
  }

  const intervalosAusencia = profissional.ausencias.map((ausencia) => ({
    inicio: apenasData(ausencia.dataInicio),
    fim: apenasData(ausencia.dataFim),
  }));

  const dataInicio = apenasData(new Date());
  const dataFim = new Date(dataInicio);
  dataFim.setDate(dataFim.getDate() + dias);

  const agendamentosExistentes = await clientePrisma.agendamento.findMany({
    where: {
      profissionalId,
      status: { not: "CANCELADO" },
      data: { gte: dataInicio, lt: dataFim },
    },
    include: { servico: true },
  });

  const agora = new Date();
  const inicioHoje = apenasData(agora);
  const resultado = [];

  for (let i = 0; i < dias; i++) {
    const dia = new Date(dataInicio);
    dia.setDate(dia.getDate() + i);

    const janelas = janelasPorDiaSemana.get(dia.getDay()) || [];
    const bloqueado = intervalosAusencia.some((intervalo) => dia >= intervalo.inicio && dia <= intervalo.fim);

    if (janelas.length === 0 || bloqueado) {
      resultado.push({ data: formatarData(dia), horarios: [] });
      continue;
    }

    const intervalosOcupados = agendamentosExistentes
      .filter((a) => apenasData(a.data).getTime() === dia.getTime())
      .map((a) => {
        const inicio = a.data.getHours() * 60 + a.data.getMinutes();
        return [inicio, inicio + a.servico.duracaoMinutos];
      });

    const minutoInicioMinimo =
      dia.getTime() === inicioHoje.getTime() ? agora.getHours() * 60 + agora.getMinutes() + 1 : 0;

    const horarios = calcularHorariosLivres({
      janelas,
      intervalosOcupados,
      duracaoMinutos: servico.duracaoMinutos,
      minutoInicioMinimo,
    });

    resultado.push({ data: formatarData(dia), horarios });
  }

  return resultado;
}

// Confere se um horário específico ainda está livre. Recebe opcionalmente um
// `clientePrisma` de transação, para ser chamada dentro do mesmo `$transaction`
// que cria o agendamento (evita condição de corrida entre duas reservas).
export async function estaHorarioLivre({ profissionalId, servicoId, data }, clientePrisma = prisma) {
  const servico = await clientePrisma.servico.findUnique({ where: { id: servicoId } });
  if (!servico) return false;

  const inicioHorario = new Date(data);
  if (inicioHorario <= new Date()) return false;

  const inicioDia = apenasData(inicioHorario);
  const fimDia = new Date(inicioDia);
  fimDia.setDate(fimDia.getDate() + 1);

  const profissional = await clientePrisma.profissional.findUnique({
    where: { id: profissionalId },
    include: { horariosTrabalho: true, ausencias: true },
  });
  if (!profissional || !profissional.ativo) return false;

  const bloqueado = profissional.ausencias.some(
    (ausencia) => inicioDia >= apenasData(ausencia.dataInicio) && inicioDia <= apenasData(ausencia.dataFim)
  );
  if (bloqueado) return false;

  const janelas = profissional.horariosTrabalho
    .filter((h) => h.diaSemana === inicioHorario.getDay())
    .map((h) => ({ minutoInicio: h.minutoInicio, minutoFim: h.minutoFim }));

  const minutoInicio = inicioHorario.getHours() * 60 + inicioHorario.getMinutes();
  const minutoFim = minutoInicio + servico.duracaoMinutos;
  if (!estaDentroJanelas(minutoInicio, minutoFim, janelas)) return false;

  const agendamentosExistentes = await clientePrisma.agendamento.findMany({
    where: {
      profissionalId,
      status: { not: "CANCELADO" },
      data: { gte: inicioDia, lt: fimDia },
    },
    include: { servico: true },
  });

  return agendamentosExistentes.every((a) => {
    const inicioOcupado = a.data.getHours() * 60 + a.data.getMinutes();
    const fimOcupado = inicioOcupado + a.servico.duracaoMinutos;
    return minutoInicio >= fimOcupado || minutoFim <= inicioOcupado;
  });
}
