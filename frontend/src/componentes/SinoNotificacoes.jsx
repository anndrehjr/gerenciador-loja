import { useEffect, useRef, useState } from "react";
import { Bell, Gift, Wallet, CalendarX, PackageX, Award, AlertTriangle } from "lucide-react";
import { api } from "../biblioteca/api.js";

const ICONE_POR_TIPO = {
  ANIVERSARIANTE: Gift,
  PAGAMENTO_RECEBIDO: Wallet,
  AGENDAMENTO_CANCELADO: CalendarX,
  ESTOQUE_BAIXO: PackageX,
  COMISSAO_LIBERADA: Award,
  ASSINATURA_VENCENDO: AlertTriangle,
};

export default function SinoNotificacoes() {
  const [aberto, setAberto] = useState(false);
  const [notificacoes, setNotificacoes] = useState(null);
  const [naoLidas, setNaoLidas] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    api
      .get("/notifications/nao-lidas")
      .then((r) => setNaoLidas(r.total))
      .catch(() => {});
  }, []);

  useEffect(() => {
    function aoClicarFora(e) {
      if (ref.current && !ref.current.contains(e.target)) setAberto(false);
    }
    document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, []);

  function alternar() {
    const vaiAbrir = !aberto;
    setAberto(vaiAbrir);
    if (vaiAbrir && notificacoes === null) {
      api.get("/notifications").then(setNotificacoes).catch(() => setNotificacoes([]));
    }
  }

  async function marcarTodasLidas() {
    await api.post("/notifications/marcar-todas-lidas", {});
    setNaoLidas(0);
    setNotificacoes((atual) => (atual || []).map((n) => ({ ...n, lida: true })));
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={alternar}
        aria-label={naoLidas > 0 ? `Notificações — ${naoLidas} não lidas` : "Notificações"}
        className="relative rounded-lg p-2 text-muted transition duration-200 hover:bg-hover hover:text-ink"
      >
        <Bell className="h-4 w-4" />
        {naoLidas > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-critical" />}
      </button>

      {aberto && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[90vw] overflow-hidden rounded-2xl border border-line bg-surface shadow-soft">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <span className="text-sm font-semibold">Notificações</span>
            {naoLidas > 0 && (
              <button onClick={marcarTodasLidas} className="text-xs text-accent-ink hover:underline">
                Marcar todas como lidas
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notificacoes === null ? (
              <p className="p-4 text-sm text-muted">Carregando…</p>
            ) : notificacoes.length === 0 ? (
              <p className="p-4 text-sm text-muted">Nenhuma notificação ainda.</p>
            ) : (
              <ul className="divide-y divide-line">
                {notificacoes.map((n) => {
                  const Icone = ICONE_POR_TIPO[n.tipo] || Bell;
                  return (
                    <li key={n.id} className={`flex gap-3 px-4 py-3 text-sm ${n.lida ? "" : "bg-accent/5"}`}>
                      <Icone className="mt-0.5 h-4 w-4 shrink-0 text-accent-ink" />
                      <div className="min-w-0">
                        <div className="font-medium">{n.titulo}</div>
                        <div className="mt-0.5 text-muted">{n.mensagem}</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
