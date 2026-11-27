import { prisma } from "../biblioteca/prisma.js";
import { ambiente } from "../configuracao/ambiente.js";
import { verificarTokenSessao } from "../utilitarios/jwt.js";
import { assinaturaEstaBloqueada } from "../servicos/assinatura.servico.js";
import { manipuladorAssincrono } from "../utilitarios/manipuladorAssincrono.js";

// O JWT dura até 8h (ver utilitarios/jwt.js) e antes só era conferido contra
// o banco no login — suspender um salão ou remover alguém da equipe não
// surtia efeito até o token expirar sozinho. Por isso toda requisição
// autenticada paga o custo de 1-2 leituras indexadas extras (Usuario por PK,
// Salao pela relação) em troca de revogação de verdade (auditoria de
// 2026-07-31, achado "Alto": sem revogação de sessão).
async function exigirAutenticacaoAsync(req, res, next) {
  const token = req.cookies?.[ambiente.COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ error: "Não autenticado." });
  }

  let payload;
  try {
    payload = verificarTokenSessao(token);
  } catch {
    return res.status(401).json({ error: "Sessão inválida ou expirada." });
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: payload.sub },
    select: { id: true, salaoId: true, salao: { select: { status: true } } },
  });
  // Cobre o usuário removido da equipe: removerMembroEquipe apaga o Usuario
  // inteiro (ver servicos/equipe.servico.js), não só o vínculo.
  if (!usuario) {
    return res.status(401).json({ error: "Sessão inválida ou expirada." });
  }
  if (usuario.salao?.status === "SUSPENSO") {
    return res.status(403).json({ error: "Este salão está suspenso. Fale com o suporte." });
  }
  if (usuario.salaoId && (await assinaturaEstaBloqueada(usuario.salaoId))) {
    return res.status(402).json({ error: "O período de teste do seu salão acabou. Fale com a gente pra continuar usando." });
  }

  req.usuario = payload;
  next();
}

export const exigirAutenticacao = manipuladorAssincrono(exigirAutenticacaoAsync);

// Usar depois de exigirAutenticacao em toda rota que opera em dados de um
// salão (clientes, serviços, agendamentos...). Bloqueia usuários MESTRE, que
// não têm salaoId — eles usam o painel mestre, não essas rotas. req.salaoId
// fica disponível pra todo controlador usar como filtro obrigatório nas queries.
async function exigirSalaoAsync(req, res, next) {
  if (!req.usuario?.salaoId) {
    return res.status(403).json({ error: "Esta rota exige um usuário vinculado a um salão." });
  }
  req.salaoId = req.usuario.salaoId;

  // Papel lido fresco do MembroEquipe, não do JWT: uma troca de papel feita
  // pelo DONO no meio da sessão de outra pessoa passa a valer já na próxima
  // requisição, não só no próximo login (antes só `me()` lia isso fresco).
  // Disponíveis pros controladores aplicarem escopo fino (Fase 5) — ex.:
  // um PROFISSIONAL só vê a própria agenda mesmo que passe outro id na query.
  const membro = await prisma.membroEquipe.findUnique({
    where: { usuarioId_salaoId: { usuarioId: req.usuario.sub, salaoId: req.salaoId } },
  });
  req.papelEquipe = membro?.papel || req.usuario.papelEquipe;
  req.profissionalId = membro?.profissionalId ?? req.usuario.profissionalId;
  next();
}

export const exigirSalao = manipuladorAssincrono(exigirSalaoAsync);

// Usar depois de exigirAutenticacao em toda rota do painel mestre.
export function exigirMestre(req, res, next) {
  if (req.usuario?.papel !== "MESTRE") {
    return res.status(403).json({ error: "Acesso restrito." });
  }
  next();
}
