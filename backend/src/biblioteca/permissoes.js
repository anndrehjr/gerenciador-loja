// Matriz de permissões por PapelEquipe (Fase 5 da evolução SaaS). Espelhada
// em frontend/src/biblioteca/permissoes.js — mesmo vocabulário dos dois
// lados, igual já é feito com biblioteca/planos.js.
//
// "painel"/"agenda"/"clientes" ficam liberados pros 4 papéis de propósito —
// são a base mínima pra alguém conseguir trabalhar no dia a dia. Serviços,
// Equipe (gestão, não leitura), Financeiro, Relatórios e Configurações são
// exclusivos de quem a auditoria definiu explicitamente.
export const RECURSOS_POR_PAPEL = {
  DONO: ["painel", "agenda", "clientes", "servicos", "equipe", "financeiro", "relatorios", "configuracoes", "estoque", "notificacoes"],
  GERENTE: ["painel", "agenda", "clientes", "equipe", "notificacoes"],
  PROFISSIONAL: ["painel", "agenda", "clientes", "notificacoes"],
  RECEPCIONISTA: ["painel", "agenda", "clientes", "notificacoes"],
};

export function papelEquipeTemAcesso(papelEquipe, recurso) {
  return (RECURSOS_POR_PAPEL[papelEquipe] || []).includes(recurso);
}
