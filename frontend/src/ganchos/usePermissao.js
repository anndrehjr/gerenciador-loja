import { useAutenticacao } from "../contextos/ContextoAutenticacao.jsx";
import { temAcesso } from "../biblioteca/permissoes.js";

// Só decide o que MOSTRAR (menu, botões) — a autorização de verdade é
// sempre imposta pelo backend (verificarPermissao), isto aqui nunca é a
// última linha de defesa.
export function usePermissao() {
  const { usuario } = useAutenticacao();
  return {
    papelEquipe: usuario?.papelEquipe || null,
    pode: (recurso) => temAcesso(usuario?.papelEquipe, recurso),
  };
}
