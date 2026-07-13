import { env } from "../config/env.js";
import { verifySessionToken } from "../utils/jwt.js";

export function requireAuth(req, res, next) {
  const token = req.cookies?.[env.COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ error: "Não autenticado." });
  }

  try {
    req.user = verifySessionToken(token);
    next();
  } catch {
    return res.status(401).json({ error: "Sessão inválida ou expirada." });
  }
}

// Usar depois de requireAuth em toda rota que opera em dados de um salão
// (clientes, serviços, agendamentos...). Bloqueia usuários MASTER, que não
// têm salonId — eles usam o painel master, não essas rotas. req.salonId fica
// disponível pra todo controller usar como filtro obrigatório nas queries.
export function requireSalon(req, res, next) {
  if (!req.user?.salonId) {
    return res.status(403).json({ error: "Esta rota exige um usuário vinculado a um salão." });
  }
  req.salonId = req.user.salonId;
  next();
}

// Usar depois de requireAuth em toda rota do painel master.
export function requireMaster(req, res, next) {
  if (req.user?.role !== "MASTER") {
    return res.status(403).json({ error: "Acesso restrito." });
  }
  next();
}
