import jwt from "jsonwebtoken";
import { ambiente } from "../configuracao/ambiente.js";

const EXPIRA_EM = "8h";
const ALGORITMO = "HS256";

export function assinarTokenSessao(usuario, membroEquipe = null) {
  return jwt.sign(
    {
      sub: usuario.id,
      papel: usuario.papel,
      salaoId: usuario.salaoId,
      papelEquipe: membroEquipe?.papel || null,
      profissionalId: membroEquipe?.profissionalId || null,
    },
    ambiente.JWT_SECRET,
    { expiresIn: EXPIRA_EM, algorithm: ALGORITMO }
  );
}

export function verificarTokenSessao(token) {
  return jwt.verify(token, ambiente.JWT_SECRET, { algorithms: [ALGORITMO] });
}

export const DURACAO_MAXIMA_COOKIE_MS = 8 * 60 * 60 * 1000;
