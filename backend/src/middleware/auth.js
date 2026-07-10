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
