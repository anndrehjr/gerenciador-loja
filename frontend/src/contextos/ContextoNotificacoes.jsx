import { createContext, useCallback, useContext, useEffect, useState } from "react";
import Mensagem from "../componentes/ui/Mensagem.jsx";

const ContextoNotificacoes = createContext(null);

// Registrado pelo ProvedorNotificacoes ao montar — permite chamar
// mostrarMensagem(...) de qualquer lugar (handlers, funções fora de
// componente), não só de dentro de um componente React via hook.
let emissorAtivo = null;
let proximoId = 0;

export function ProvedorNotificacoes({ children }) {
  const [notificacoes, setNotificacoes] = useState([]);

  const remover = useCallback((id) => {
    setNotificacoes((atual) => atual.filter((n) => n.id !== id));
  }, []);

  const adicionar = useCallback(
    (notificacao) => {
      const id = ++proximoId;
      const duracaoMs = notificacao.duracaoMs ?? 5000;
      setNotificacoes((atual) => [...atual, { id, ...notificacao }]);
      if (duracaoMs) setTimeout(() => remover(id), duracaoMs);
      return id;
    },
    [remover]
  );

  useEffect(() => {
    emissorAtivo = adicionar;
    return () => {
      if (emissorAtivo === adicionar) emissorAtivo = null;
    };
  }, [adicionar]);

  return (
    <ContextoNotificacoes.Provider value={{ mostrarMensagem: adicionar, removerMensagem: remover }}>
      {children}

      <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:left-auto sm:right-4 sm:items-end">
        {notificacoes.map((n) => (
          <div key={n.id} className="pointer-events-auto w-full max-w-sm animate-[entrarNotificacao_0.25s_ease-out]">
            <Mensagem tipo={n.tipo} titulo={n.titulo} texto={n.texto} />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes entrarNotificacao {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes entrarNotificacao { from, to { opacity: 1; transform: none; } }
        }
      `}</style>
    </ContextoNotificacoes.Provider>
  );
}

export function useNotificacoes() {
  const ctx = useContext(ContextoNotificacoes);
  if (!ctx) throw new Error("useNotificacoes deve ser usado dentro de ProvedorNotificacoes");
  return ctx;
}

// API imperativa global, como pedido: mostrarMensagem({ tipo: "sucesso", texto: "Cliente salvo com sucesso" }).
// Tipos: "sucesso" | "erro" | "alerta" | "informacao". Só funciona depois que
// ProvedorNotificacoes montar — main.jsx garante isso, já que ele envolve
// toda a árvore antes de qualquer tela renderizar.
export function mostrarMensagem(notificacao) {
  if (!emissorAtivo) {
    console.warn("mostrarMensagem chamado antes de ProvedorNotificacoes montar:", notificacao);
    return;
  }
  return emissorAtivo(notificacao);
}
