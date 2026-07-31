import { z } from "zod";
import crypto from "node:crypto";
import { prisma } from "../biblioteca/prisma.js";
import { verificarSenha, gerarHashSenha } from "../utilitarios/senha.js";
import { assinarTokenSessao, DURACAO_MAXIMA_COOKIE_MS } from "../utilitarios/jwt.js";
import { ambiente } from "../configuracao/ambiente.js";
import { ErroHttp } from "../middleware/tratadorErros.js";
import { resolverMembroEquipe } from "../servicos/equipe.servico.js";
import { registrarAuditoria } from "../servicos/auditoria.servico.js";
import { assinaturaEstaBloqueada } from "../servicos/assinatura.servico.js";

const esquemaLogin = z.object({
  email: z.string().email(),
  senha: z.string().min(1),
});

// hash bcrypt de uma senha aleatória fixa, usado só pra manter o tempo de
// resposta constante quando o email não existe (evita enumerar emails válidos).
const HASH_FALSO = "$2a$12$CwTycUXWue0Thq9StjUM0uJ8vMxxV4pJC6ZlOF2ZoQO3vzYAY6Sfy";

const opcoesCookie = {
  httpOnly: true,
  sameSite: "lax",
  secure: ambiente.COOKIE_SECURE,
  maxAge: DURACAO_MAXIMA_COOKIE_MS,
  path: "/",
};

export async function login(req, res) {
  const { email, senha } = esquemaLogin.parse(req.body);

  const usuario = await prisma.usuario.findUnique({ where: { email }, include: { salao: true } });
  const valido = await verificarSenha(senha, usuario?.senhaHash || HASH_FALSO);

  if (!usuario || !valido) {
    await registrarAuditoria({ acao: "login.falha", entidade: "Usuario", detalhes: { email }, ip: req.ip });
    throw new ErroHttp(401, "Credenciais inválidas.");
  }

  if (usuario.salao && usuario.salao.status === "SUSPENSO") {
    throw new ErroHttp(403, "Este salão está suspenso. Fale com o suporte.");
  }

  // Bloqueio por vencimento (Fase 11) — MESTRE nunca tem salaoId, então
  // nunca é afetado por isso.
  if (usuario.salaoId && (await assinaturaEstaBloqueada(usuario.salaoId))) {
    throw new ErroHttp(402, "O período de teste do seu salão acabou. Fale com a gente pra continuar usando.");
  }

  const membroEquipe = await resolverMembroEquipe(usuario);

  const token = assinarTokenSessao(usuario, membroEquipe);
  res.cookie(ambiente.COOKIE_NAME, token, opcoesCookie);
  registrarAuditoria({
    usuarioId: usuario.id,
    salaoId: usuario.salaoId,
    acao: "login.sucesso",
    entidade: "Usuario",
    entidadeId: usuario.id,
    ip: req.ip,
  }).catch(() => {});
  res.json({
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    papel: usuario.papel,
    salaoId: usuario.salaoId,
    papelEquipe: membroEquipe?.papel || null,
  });
}

export async function logout(req, res) {
  res.clearCookie(ambiente.COOKIE_NAME, { ...opcoesCookie, maxAge: undefined });
  res.status(204).send();
}

export async function me(req, res) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: req.usuario.sub },
    include: { salao: { select: { nome: true } } },
  });
  if (!usuario) {
    throw new ErroHttp(401, "Sessão inválida.");
  }
  // Lido fresco do banco (não do JWT) — reflete uma troca de papel feita
  // pelo DONO no meio da sessão sem esperar o usuário logar de novo,
  // mesmo que a autorização de fato (verificarPermissao) só valha a partir
  // do próximo login, já que é o JWT que ela lê.
  const membroEquipe = await resolverMembroEquipe(usuario);
  res.json({
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    papel: usuario.papel,
    salaoId: usuario.salaoId,
    papelEquipe: membroEquipe?.papel || null,
    nomeSalao: usuario.salao?.nome ?? null,
  });
}

const DURACAO_TOKEN_REDEFINICAO_MS = 60 * 60 * 1000; // 1 hora

function gerarTokenBruto() {
  return crypto.randomBytes(32).toString("hex");
}

// Só o hash do token fica no banco — igual à senha, um vazamento do banco
// sozinho não é suficiente pra alguém redefinir a senha de outra pessoa.
function hashToken(tokenBruto) {
  return crypto.createHash("sha256").update(tokenBruto).digest("hex");
}

const esquemaEsqueciSenha = z.object({ email: z.string().email() });

// Sempre responde 204, exista ou não o email — o mesmo motivo do
// HASH_FALSO no login: não dar como enumerar quais emails têm conta.
export async function esqueciSenha(req, res) {
  const { email } = esquemaEsqueciSenha.parse(req.body);

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (usuario) {
    const tokenBruto = gerarTokenBruto();
    await prisma.tokenRedefinicaoSenha.create({
      data: {
        token: hashToken(tokenBruto),
        usuarioId: usuario.id,
        expiraEm: new Date(Date.now() + DURACAO_TOKEN_REDEFINICAO_MS),
      },
    });

    // Sem provedor de e-mail transacional configurado neste projeto ainda
    // (precisa de uma decisão/credencial, igual ao gateway de pagamento) —
    // por enquanto o link sai só no log do servidor, como o WhatsApp faz
    // quando está desligado. Trocar por um envio real de e-mail é o único
    // passo que falta pra isso funcionar de ponta a ponta em produção.
    const linkRedefinicao = `${ambiente.CORS_ORIGIN}/trocar-senha?token=${tokenBruto}`;
    console.log(`[redefinicao-senha] link pra ${email} (válido por 1h): ${linkRedefinicao}`);

    registrarAuditoria({
      usuarioId: usuario.id,
      salaoId: usuario.salaoId,
      acao: "senha.solicitar_redefinicao",
      entidade: "Usuario",
      entidadeId: usuario.id,
      ip: req.ip,
    }).catch(() => {});
  }

  res.status(204).send();
}

const esquemaTrocarSenha = z.object({
  token: z.string().min(1),
  novaSenha: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
});

export async function trocarSenha(req, res) {
  const { token, novaSenha } = esquemaTrocarSenha.parse(req.body);

  const registro = await prisma.tokenRedefinicaoSenha.findUnique({ where: { token: hashToken(token) } });
  if (!registro || registro.usadoEm || registro.expiraEm < new Date()) {
    throw new ErroHttp(400, "Link inválido ou expirado. Solicite uma nova redefinição.");
  }

  const senhaHash = await gerarHashSenha(novaSenha);
  await prisma.$transaction([
    prisma.usuario.update({ where: { id: registro.usuarioId }, data: { senhaHash } }),
    prisma.tokenRedefinicaoSenha.update({ where: { id: registro.id }, data: { usadoEm: new Date() } }),
  ]);

  const usuario = await prisma.usuario.findUnique({ where: { id: registro.usuarioId } });
  registrarAuditoria({
    usuarioId: registro.usuarioId,
    salaoId: usuario?.salaoId,
    acao: "senha.redefinir",
    entidade: "Usuario",
    entidadeId: registro.usuarioId,
    ip: req.ip,
  }).catch(() => {});

  res.status(204).send();
}

const esquemaTrocarSenhaLogado = z.object({
  senhaAtual: z.string().min(1),
  novaSenha: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
});

// Diferente de trocarSenha (via token, sem estar logado): aqui é o próprio
// usuário autenticado trocando a senha de dentro do painel (Fase 4 —
// tela de Perfil), então exige confirmar a senha atual em vez de um token.
export async function trocarMinhaSenha(req, res) {
  const { senhaAtual, novaSenha } = esquemaTrocarSenhaLogado.parse(req.body);

  const usuario = await prisma.usuario.findUnique({ where: { id: req.usuario.sub } });
  const valido = await verificarSenha(senhaAtual, usuario.senhaHash);
  if (!valido) throw new ErroHttp(401, "Senha atual incorreta.");

  const senhaHash = await gerarHashSenha(novaSenha);
  await prisma.usuario.update({ where: { id: usuario.id }, data: { senhaHash } });

  registrarAuditoria({
    usuarioId: usuario.id,
    salaoId: usuario.salaoId,
    acao: "senha.trocar_propria",
    entidade: "Usuario",
    entidadeId: usuario.id,
    ip: req.ip,
  }).catch(() => {});

  res.status(204).send();
}
