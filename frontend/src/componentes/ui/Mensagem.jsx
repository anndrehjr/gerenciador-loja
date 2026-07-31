import { CheckCircle2, XCircle, AlertTriangle, Info, Inbox } from "lucide-react";

const VARIANTES = {
  sucesso: { Icone: CheckCircle2, corBorda: "border-success/30", corIcone: "text-success" },
  erro: { Icone: XCircle, corBorda: "border-critical/30", corIcone: "text-critical" },
  alerta: { Icone: AlertTriangle, corBorda: "border-warning/30", corIcone: "text-warning" },
  informacao: { Icone: Info, corBorda: "border-line", corIcone: "text-accent-ink" },
  vazio: { Icone: Inbox, corBorda: "border-dashed border-line", corIcone: "text-muted" },
};

// Componente único pros 5 estados pedidos: sucesso/erro/alerta/informacao (usado
// tanto inline numa tela quanto como toast pelo ContextoNotificacoes) e vazio
// (estado de lista sem itens, sempre com a próxima ação já ali do lado).
export default function Mensagem({ tipo = "informacao", titulo, texto, acao, className = "" }) {
  const { Icone, corBorda, corIcone } = VARIANTES[tipo] || VARIANTES.informacao;

  return (
    <div className={`flex items-start gap-3 rounded-2xl border ${corBorda} bg-surface p-4 text-sm ${className}`}>
      <Icone className={`mt-0.5 h-4 w-4 shrink-0 ${corIcone}`} />
      <div className="flex-1">
        {titulo && <div className="font-medium text-ink">{titulo}</div>}
        {texto && <div className="mt-0.5 text-muted">{texto}</div>}
        {acao && <div className="mt-3">{acao}</div>}
      </div>
    </div>
  );
}
