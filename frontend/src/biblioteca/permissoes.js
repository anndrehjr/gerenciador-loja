// Espelha backend/src/biblioteca/permissoes.js — mesmo vocabulário dos dois
// lados, igual já é feito com planos.js. Usado só pra decidir o que MOSTRAR
// (menu, botões) — a autorização de verdade é sempre do backend.
export const RECURSOS_POR_PAPEL = {
  DONO: ["painel", "agenda", "clientes", "servicos", "equipe", "financeiro", "relatorios", "configuracoes", "estoque", "notificacoes"],
  GERENTE: ["painel", "agenda", "clientes", "equipe", "notificacoes"],
  PROFISSIONAL: ["painel", "agenda", "clientes", "notificacoes"],
  RECEPCIONISTA: ["painel", "agenda", "clientes", "notificacoes"],
};

export function temAcesso(papelEquipe, recurso) {
  // Sem papelEquipe (contas antigas ainda não migradas, ou papel === MESTRE
  // olhando o painel do salão por engano) — trata como DONO só se não houver
  // registro nenhum de papel, mantendo o comportamento de antes do RBAC
  // existir. Isso é só cosmético (esconder/mostrar menu); o backend nunca
  // confia nisso.
  if (!papelEquipe) return true;
  return (RECURSOS_POR_PAPEL[papelEquipe] || []).includes(recurso);
}
