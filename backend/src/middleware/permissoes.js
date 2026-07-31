import { papelEquipeTemAcesso } from "../biblioteca/permissoes.js";

// Usar depois de exigirAutenticacao + exigirSalao. Bloqueia (403) sem
// papelEquipe válido pro recurso pedido — nunca libera por omissão: um
// usuário sem MembroEquipe é tratado como sem acesso, não como acesso total
// (ver backend/src/servicos/equipe.servico.js pra como esse papel é resolvido
// no login).
export function verificarPermissao(recurso) {
  return (req, res, next) => {
    if (!papelEquipeTemAcesso(req.papelEquipe, recurso)) {
      return res.status(403).json({ error: "Você não tem permissão para acessar este recurso." });
    }
    next();
  };
}
