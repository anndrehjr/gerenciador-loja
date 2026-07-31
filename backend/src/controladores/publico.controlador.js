import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../biblioteca/prisma.js";
import { ErroHttp } from "../middleware/tratadorErros.js";
import { normalizarTelefone } from "../utilitarios/telefone.js";
import { obterFaixaDisponibilidade, estaHorarioLivre } from "../biblioteca/disponibilidade.js";
import { enviarConfirmacaoAgendamento } from "../biblioteca/whatsapp.js";

const MENSAGEM_HORARIO_OCUPADO = "Esse horário acabou de ficar indisponível. Escolha outro.";

// Só os campos seguros pra expor sem autenticação — nunca dominio/slug,
// nem os dados cadastrais/legais (CPF-CNPJ, razão social, contrato...).
// endereco/cidade/estado e o whatsapp existem aqui de propósito: são a forma
// do cliente final achar e contatar o salão, então são públicos por natureza.
export async function obterInfoSalaoPublico(req, res) {
  res.json({
    id: req.salao.id,
    nome: req.salao.nome,
    plano: req.salao.plano,
    categoria: req.salao.categoria,
    template: req.salao.template,
    urlLogo: req.salao.urlLogo,
    urlBanner: req.salao.urlBanner,
    corPrimaria: req.salao.corPrimaria,
    personalizacao: req.salao.personalizacao,
    endereco: req.salao.endereco,
    cidade: req.salao.cidade,
    estado: req.salao.estado,
    whatsapp: req.salao.whatsappProprietario,
  });
}

export async function listarServicosPublicos(req, res) {
  const servicos = await prisma.servico.findMany({
    where: { salaoId: req.salaoId, ativo: true },
    orderBy: { nome: "asc" },
    select: {
      id: true,
      nome: true,
      descricao: true,
      precoCentavos: true,
      duracaoMinutos: true,
      profissionais: { select: { profissional: { select: { id: true, nome: true } } } },
    },
  });
  res.json(
    servicos.map(({ profissionais, ...servico }) => ({
      ...servico,
      profissionais: profissionais.map((p) => p.profissional),
    }))
  );
}

export async function listarProfissionaisPublicos(req, res) {
  const profissionais = await prisma.profissional.findMany({
    where: { salaoId: req.salaoId, ativo: true },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true, urlFoto: true, especialidade: true, bio: true },
  });
  res.json(profissionais);
}

export async function buscarClientePorTelefone(req, res) {
  const telefone = normalizarTelefone(String(req.query.telefone || ""));
  if (!telefone) throw new ErroHttp(400, "Informe um telefone.");

  // Devolve só o mínimo pra continuar o agendamento (id do cliente) — nunca
  // nome, e-mail ou histórico, já que quem pergunta ainda não provou ser o
  // dono do número. Isso evita que o telefone sozinho vire uma forma de
  // varrer/enumerar dados de clientes reais do salão.
  const cliente = await prisma.cliente.findFirst({
    where: { telefone, salaoId: req.salaoId },
    select: { id: true },
  });

  if (!cliente) {
    return res.json({ encontrado: false });
  }

  res.json({ encontrado: true, clienteId: cliente.id });
}

const esquemaNovoCliente = z.object({
  nome: z.string().min(1),
  telefone: z
    .string()
    .transform(normalizarTelefone)
    .refine((v) => v.length >= 10, "Telefone inválido."),
  email: z.string().email().optional().nullable(),
});

export async function criarClientePublico(req, res) {
  const dados = esquemaNovoCliente.parse(req.body);

  const existente = await prisma.cliente.findFirst({
    where: { telefone: dados.telefone, salaoId: req.salaoId },
    select: { id: true },
  });
  if (existente) {
    return res.status(200).json({ id: existente.id });
  }

  const cliente = await prisma.cliente
    .create({ data: { ...dados, salaoId: req.salaoId } })
    .catch((err) => {
      if (err.code === "P2002") throw new ErroHttp(409, "Já existe um cliente com esses dados.");
      throw err;
    });
  res.status(201).json(cliente);
}

const esquemaConsultaDisponibilidade = z.object({
  servicoId: z.string().min(1),
  dias: z.coerce.number().int().min(1).max(60).optional(),
});

export async function obterDisponibilidadePublica(req, res) {
  const { servicoId, dias } = esquemaConsultaDisponibilidade.parse(req.query);

  const [profissional, servico] = await Promise.all([
    prisma.profissional.findFirst({ where: { id: req.params.id, salaoId: req.salaoId } }),
    prisma.servico.findFirst({ where: { id: servicoId, salaoId: req.salaoId } }),
  ]);
  if (!profissional) throw new ErroHttp(404, "Profissional não encontrado.");
  if (!servico) throw new ErroHttp(404, "Serviço não encontrado.");

  const disponibilidade = await obterFaixaDisponibilidade({
    profissionalId: req.params.id,
    servicoId,
    dias: dias || 21,
  });
  if (!disponibilidade) throw new ErroHttp(404, "Serviço ou profissional indisponível.");

  res.json(disponibilidade);
}

const esquemaAgendamentoPublico = z.object({
  clienteId: z.string().min(1),
  servicoId: z.string().min(1),
  profissionalId: z.string().min(1),
  data: z.coerce.date(),
});

export async function criarAgendamentoPublico(req, res) {
  const dados = esquemaAgendamentoPublico.parse(req.body);

  const [cliente, servico, profissional] = await Promise.all([
    prisma.cliente.findFirst({ where: { id: dados.clienteId, salaoId: req.salaoId } }),
    prisma.servico.findFirst({ where: { id: dados.servicoId, salaoId: req.salaoId } }),
    prisma.profissional.findFirst({ where: { id: dados.profissionalId, salaoId: req.salaoId } }),
  ]);
  if (!cliente) throw new ErroHttp(404, "Cliente não encontrado.");
  if (!servico || !servico.ativo) throw new ErroHttp(404, "Serviço indisponível.");
  if (!profissional || !profissional.ativo) throw new ErroHttp(404, "Profissional indisponível.");

  // Serviço sem nenhum vínculo aceita qualquer profissional do salão (como
  // sempre foi); com vínculo, só valida contra quem está de fato vinculado —
  // reforça no servidor o mesmo filtro que o wizard já aplica na tela.
  const totalVinculado = await prisma.servicoProfissional.count({ where: { servicoId: dados.servicoId } });
  if (totalVinculado > 0) {
    const estaVinculado = await prisma.servicoProfissional.findUnique({
      where: { servicoId_profissionalId: { servicoId: dados.servicoId, profissionalId: dados.profissionalId } },
    });
    if (!estaVinculado) throw new ErroHttp(400, "Esse profissional não realiza o serviço selecionado.");
  }

  // Checagem + criação rodam na mesma transação serializable: se dois
  // clientes tentarem reservar o mesmo horário ao mesmo tempo, o Postgres
  // aborta uma das transações em vez de deixar as duas passarem.
  const agendamento = await prisma
    .$transaction(
      async (tx) => {
        const livre = await estaHorarioLivre(
          { profissionalId: dados.profissionalId, servicoId: dados.servicoId, data: dados.data },
          tx
        );
        if (!livre) throw new ErroHttp(409, MENSAGEM_HORARIO_OCUPADO);

        return tx.agendamento.create({
          data: { ...dados, salaoId: req.salaoId },
          include: { cliente: true, servico: true, profissional: true },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    )
    .catch((err) => {
      if (err instanceof ErroHttp) throw err;
      if (err.code === "P2034") throw new ErroHttp(409, MENSAGEM_HORARIO_OCUPADO);
      throw err;
    });

  res.status(201).json(agendamento);
  enviarConfirmacaoAgendamento(agendamento).catch(() => {});
}
