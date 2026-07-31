import { ambiente } from "../configuracao/ambiente.js";
import { verificarTokenSessao } from "../utilitarios/jwt.js";

export function exigirAutenticacao(req, res, next) {
  const token = req.cookies?.[ambiente.COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ error: "Não autenticado." });
  }

  try {
    req.usuario = verificarTokenSessao(token);
    next();
  } catch {
    return res.status(401).json({ error: "Sessão inválida ou expirada." });
  }
}

// Usar depois de exigirAutenticacao em toda rota que opera em dados de um
// salão (clientes, serviços, agendamentos...). Bloqueia usuários MESTRE, que
// não têm salaoId — eles usam o painel mestre, não essas rotas. req.salaoId
// fica disponível pra todo controlador usar como filtro obrigatório nas queries.
export function exigirSalao(req, res, next) {
  if (!req.usuario?.salaoId) {
    return res.status(403).json({ error: "Esta rota exige um usuário vinculado a um salão." });
  }
  req.salaoId = req.usuario.salaoId;
  // Disponíveis pros controladores aplicarem escopo fino (Fase 5) — ex.:
  // um PROFISSIONAL só vê a própria agenda mesmo que passe outro id na query.
  req.papelEquipe = req.usuario.papelEquipe;
  req.profissionalId = req.usuario.profissionalId;
  next();
}

// Usar depois de exigirAutenticacao em toda rota do painel mestre.
export function exigirMestre(req, res, next) {
  if (req.usuario?.papel !== "MESTRE") {
    return res.status(403).json({ error: "Acesso restrito." });
  }
  next();
}
