import { z } from "zod";
import { prisma } from "../biblioteca/prisma.js";
import { gerarHashSenha } from "../utilitarios/senha.js";
import { ErroHttp } from "../middleware/tratadorErros.js";
import { PLANOS } from "../biblioteca/planos.js";
import { registrarAuditoria } from "../servicos/auditoria.servico.js";
import { criarSalaoComDono } from "../servicos/onboarding.servico.js";

const REGEX_SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const CATEGORIAS = ["FEMININO", "BARBEARIA", "UNISSEX", "ESTETICA", "OUTROS"];

const campoSlug = z.string().regex(REGEX_SLUG, "Use apenas letras minúsculas, números e hífen.");

const camposCadastrais = {
  documento: z.string().min(1).optional().nullable(),
  razaoSocial: z.string().min(1).optional().nullable(),
  nomeFantasia: z.string().min(1).optional().nullable(),
  nomeProprietario: z.string().min(1).optional().nullable(),
  telefoneProprietario: z.string().min(1).optional().nullable(),
  whatsappProprietario: z.string().min(1).optional().nullable(),
  emailProprietario: z.string().email().optional().nullable().or(z.literal("").transform(() => null)),
  endereco: z.string().min(1).optional().nullable(),
  cidade: z.string().min(1).optional().nullable(),
  estado: z.string().min(1).optional().nullable(),
  cep: z.string().min(1).optional().nullable(),
  categoria: z.enum(CATEGORIAS).optional(),
  statusContrato: z.enum(["TESTE", "ATIVO", "ATRASADO", "CANCELADO"]).optional(),
  vencimentoContrato: z
    .string()
    .datetime()
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null)),
  observacoes: z.string().min(1).optional().nullable(),
};

const esquemaCriarSalao = z.object({
  nome: z.string().min(1),
  slug: campoSlug,
  dominio: z.string().min(1).optional().nullable(),
  plano: z.enum(PLANOS).optional(),
  nomeAdmin: z.string().min(1),
  emailAdmin: z.string().email(),
  senhaAdmin: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
  ...camposCadastrais,
});

const esquemaAtualizarSalao = z.object({
  nome: z.string().min(1).optional(),
  slug: campoSlug.optional(),
  dominio: z.string().min(1).optional().nullable(),
  plano: z.enum(PLANOS).optional(),
  ...camposCadastrais,
});

const esquemaStatus = z.object({
  status: z.enum(["ATIVO", "SUSPENSO"]),
});

const esquemaSenha = z.object({
  senha: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
});

const CHAVES_CAMPOS_CADASTRAIS = Object.keys(camposCadastrais);

// Prisma ignora chaves com valor `undefined`, então dá pra sempre espalhar
// os campos cadastrais opcionais sem checar um por um se vieram no payload.
function selecionarCamposCadastrais(dados) {
  const selecionado = {};
  for (const chave of CHAVES_CAMPOS_CADASTRAIS) selecionado[chave] = dados[chave];
  return selecionado;
}

const comContagens = {
  _count: {
    select: { clientes: true, servicos: true, profissionais: true, agendamentos: true, usuarios: true, pagamentos: true },
  },
};

export async function listarSaloes(req, res) {
  const saloes = await prisma.salao.findMany({
    where: { deletadoEm: null },
    include: comContagens,
    orderBy: { criadoEm: "desc" },
  });
  res.json(saloes);
}

// Faturamento e último acesso não vêm de colunas do Salao — são agregados
// à parte (soma de Pagamento e o LogAuditoria mais recente de "login.sucesso")
// só na tela de detalhe, pra não pesar a listagem geral do Painel Mestre.
export async function obterSalao(req, res) {
  const salao = await prisma.salao.findFirst({
    where: { id: req.params.id, deletadoEm: null },
    include: {
      ...comContagens,
      usuarios: {
        select: {
          id: true,
          nome: true,
          email: true,
          papel: true,
          membrosEquipe: { select: { papel: true }, take: 1 },
        },
      },
    },
  });
  if (!salao) throw new ErroHttp(404, "Salão não encontrado.");

  const [faturamento, ultimoLogin, planoAtual] = await Promise.all([
    prisma.pagamento.aggregate({ where: { salaoId: salao.id }, _sum: { valorCentavos: true } }),
    prisma.logAuditoria.findFirst({
      where: { salaoId: salao.id, acao: "login.sucesso" },
      orderBy: { criadoEm: "desc" },
      select: { criadoEm: true },
    }),
    prisma.plano.findUnique({ where: { chave: salao.plano }, select: { nome: true, precoCentavos: true } }),
  ]);

  res.json({
    ...salao,
    usuarios: salao.usuarios.map((u) => ({
      id: u.id,
      nome: u.nome,
      email: u.email,
      papel: u.papel,
      papelEquipe: u.membrosEquipe[0]?.papel || null,
    })),
    faturamentoTotalCentavos: faturamento._sum.valorCentavos || 0,
    ultimoAcessoEm: ultimoLogin?.criadoEm || null,
    planoAtual,
  });
}

export async function criarSalao(req, res) {
  const dados = esquemaCriarSalao.parse(req.body);
  const senhaHash = await gerarHashSenha(dados.senhaAdmin);

  const salao = await criarSalaoComDono({
    nome: dados.nome,
    slug: dados.slug,
    dominio: dados.dominio,
    plano: dados.plano,
    senhaHash,
    nomeAdmin: dados.nomeAdmin,
    emailAdmin: dados.emailAdmin,
    camposCadastrais: selecionarCamposCadastrais(dados),
  }).catch((err) => {
    if (err.code === "P2002") {
      throw new ErroHttp(409, "Já existe um salão com esse slug/domínio, ou um usuário com esse email.");
    }
    throw err;
  });

  registrarAuditoria({
    usuarioId: req.usuario.sub,
    salaoId: salao.id,
    acao: "salao.criar",
    entidade: "Salao",
    entidadeId: salao.id,
    ip: req.ip,
  }).catch(() => {});

  res.status(201).json(salao);
}

export async function atualizarSalao(req, res) {
  const dados = esquemaAtualizarSalao.parse(req.body);

  const salao = await prisma.salao
    .update({ where: { id: req.params.id }, data: dados })
    .catch((err) => {
      if (err.code === "P2025") throw new ErroHttp(404, "Salão não encontrado.");
      if (err.code === "P2002") throw new ErroHttp(409, "Slug ou domínio já em uso por outro salão.");
      throw err;
    });

  res.json(salao);
}

export async function definirStatusSalao(req, res) {
  const { status } = esquemaStatus.parse(req.body);

  const salao = await prisma.salao
    .update({ where: { id: req.params.id }, data: { status } })
    .catch((err) => {
      if (err.code === "P2025") throw new ErroHttp(404, "Salão não encontrado.");
      throw err;
    });

  registrarAuditoria({
    usuarioId: req.usuario.sub,
    salaoId: salao.id,
    acao: status === "SUSPENSO" ? "salao.suspender" : "salao.ativar",
    entidade: "Salao",
    entidadeId: salao.id,
    ip: req.ip,
  }).catch(() => {});

  res.json(salao);
}

// Suporte — o Mestre redefine a senha de um usuário de um salão-cliente
// (ex.: dono esqueceu a senha e não tem e-mail configurado pra usar
// /esqueci-senha sozinho). Confere que o usuário é mesmo desse salão antes
// de mexer, pra um id de outro salão não vazar por engano.
export async function definirSenhaUsuario(req, res) {
  const { senha } = esquemaSenha.parse(req.body);

  const usuario = await prisma.usuario.findFirst({ where: { id: req.params.userId, salaoId: req.params.id } });
  if (!usuario) throw new ErroHttp(404, "Usuário não encontrado.");

  const senhaHash = await gerarHashSenha(senha);
  await prisma.usuario.update({ where: { id: usuario.id }, data: { senhaHash } });

  registrarAuditoria({
    usuarioId: req.usuario.sub,
    salaoId: req.params.id,
    acao: "usuario.senha_redefinida_por_mestre",
    entidade: "Usuario",
    entidadeId: usuario.id,
    ip: req.ip,
  }).catch(() => {});

  res.status(204).send();
}

// Soft delete (Fase 12) — some da lista do Painel Mestre e (por também
// marcar status SUSPENSO) ninguém do salão consegue mais logar, mas os
// dados ficam intactos pra auditoria/recuperação em vez de apagados na hora.
export async function excluirSalao(req, res) {
  const salao = await prisma.salao
    .update({ where: { id: req.params.id }, data: { deletadoEm: new Date(), status: "SUSPENSO" } })
    .catch((err) => {
      if (err.code === "P2025") throw new ErroHttp(404, "Salão não encontrado.");
      throw err;
    });

  registrarAuditoria({
    usuarioId: req.usuario.sub,
    salaoId: salao.id,
    acao: "salao.excluir",
    entidade: "Salao",
    entidadeId: salao.id,
    ip: req.ip,
  }).catch(() => {});

  res.status(204).send();
}
