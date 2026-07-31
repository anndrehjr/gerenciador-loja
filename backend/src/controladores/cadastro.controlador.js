import { z } from "zod";
import { prisma } from "../biblioteca/prisma.js";
import { gerarHashSenha } from "../utilitarios/senha.js";
import { ErroHttp } from "../middleware/tratadorErros.js";
import { criarSalaoComDono } from "../servicos/onboarding.servico.js";
import { assinarTokenSessao, DURACAO_MAXIMA_COOKIE_MS } from "../utilitarios/jwt.js";
import { ambiente } from "../configuracao/ambiente.js";
import { resolverMembroEquipe } from "../servicos/equipe.servico.js";
import { registrarAuditoria } from "../servicos/auditoria.servico.js";

// Mesmas 5 categorias já usadas em toda a personalização da landing
// (frontend/src/biblioteca/tiposSalao.js) — o cadastro público reaproveita
// esse vocabulário em vez de inventar um novo, pra não fragmentar o que já
// existe (o Passo 2 do onboarding usa esses mesmos cartões).
const CATEGORIAS = ["FEMININO", "BARBEARIA", "UNISSEX", "ESTETICA", "OUTROS"];
const MAPA_ACENTOS = { á: "a", à: "a", â: "a", ã: "a", é: "e", ê: "e", í: "i", ó: "o", ô: "o", õ: "o", ú: "u", ç: "c" };

function slugificar(valor) {
  return valor
    .toLowerCase()
    .replace(/[áàâãéêíóôõúç]/g, (ch) => MAPA_ACENTOS[ch] || ch)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function gerarSlugDisponivel(base) {
  let slug = base || "salao";
  for (let tentativa = 0; tentativa < 5; tentativa++) {
    const existente = await prisma.salao.findUnique({ where: { slug } });
    if (!existente) return slug;
    slug = `${base || "salao"}-${Math.random().toString(36).slice(2, 6)}`;
  }
  throw new ErroHttp(500, "Não foi possível gerar um endereço único pro seu salão. Tente novamente.");
}

const esquemaCadastro = z.object({
  nomeNegocio: z.string().min(1),
  categoria: z.enum(CATEGORIAS),
  nomeAdmin: z.string().min(1),
  emailAdmin: z.string().email(),
  senhaAdmin: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
});

const opcoesCookie = {
  httpOnly: true,
  sameSite: "lax",
  secure: ambiente.COOKIE_SECURE,
  maxAge: DURACAO_MAXIMA_COOKIE_MS,
  path: "/",
};

// Cadastro público (Fase 6) — equivalente self-service de mestre.controlador.js
// `criarSalao`, mas sem exigir sessão MESTRE, sempre plano START e sempre
// entrando em teste grátis (ver servicos/assinatura.servico.js). Já termina
// logado (mesmo cookie de sessão que POST /auth/login gera), pra emendar
// direto nos passos 4/5/6 do wizard sem pedir login de novo.
export async function cadastrarSalao(req, res) {
  const dados = esquemaCadastro.parse(req.body);
  const slug = await gerarSlugDisponivel(slugificar(dados.nomeNegocio));
  const senhaHash = await gerarHashSenha(dados.senhaAdmin);

  const salao = await criarSalaoComDono({
    nome: dados.nomeNegocio,
    slug,
    plano: "START",
    categoria: dados.categoria,
    senhaHash,
    nomeAdmin: dados.nomeAdmin,
    emailAdmin: dados.emailAdmin,
    camposCadastrais: { nomeProprietario: dados.nomeAdmin, emailProprietario: dados.emailAdmin },
  }).catch((err) => {
    if (err.code === "P2002") throw new ErroHttp(409, "Já existe uma conta com esse e-mail.");
    throw err;
  });

  const admin = await prisma.usuario.findUnique({ where: { email: dados.emailAdmin } });
  const membroEquipe = await resolverMembroEquipe(admin);
  const token = assinarTokenSessao(admin, membroEquipe);
  res.cookie(ambiente.COOKIE_NAME, token, opcoesCookie);

  registrarAuditoria({
    usuarioId: admin.id,
    salaoId: salao.id,
    acao: "salao.cadastro_publico",
    entidade: "Salao",
    entidadeId: salao.id,
    ip: req.ip,
  }).catch(() => {});

  res.status(201).json({
    id: admin.id,
    nome: admin.nome,
    email: admin.email,
    papel: admin.papel,
    salaoId: admin.salaoId,
    papelEquipe: membroEquipe?.papel || null,
    salaoSlug: salao.slug,
  });
}
