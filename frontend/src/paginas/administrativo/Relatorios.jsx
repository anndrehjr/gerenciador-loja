import { useEffect, useState } from "react";
import { UserPlus, UserX, TrendingUp } from "lucide-react";
import { api } from "../../biblioteca/api.js";
import { formatarDataHora } from "../../biblioteca/formatacao.js";
import CartaoEstatistica from "../../componentes/ui/CartaoEstatistica.jsx";
import Cartao from "../../componentes/ui/Cartao.jsx";
import Esqueleto from "../../componentes/ui/Esqueleto.jsx";
import Mensagem from "../../componentes/ui/Mensagem.jsx";

function ListaRanking({ itens, vazio }) {
  if (!itens.length) return <p className="text-sm text-muted">{vazio}</p>;
  const maior = Math.max(...itens.map((i) => i.total));
  return (
    <ul className="flex flex-col gap-3">
      {itens.map((item) => (
        <li key={item.nome} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{item.nome}</span>
            <span className="tabular-nums text-muted">{item.total}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-hover">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-accent-ink transition-all duration-500"
              style={{ width: `${maior ? (item.total / maior) * 100 : 0}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function GraficoCrescimento({ dados }) {
  const maior = Math.max(...dados.map((d) => d.agendamentosConcluidos), 1);
  return (
    <div className="flex h-40 items-end gap-3">
      {dados.map((d) => {
        const [ano, mes] = d.mes.split("-");
        const rotulo = new Date(Number(ano), Number(mes) - 1, 1).toLocaleDateString("pt-BR", { month: "short" });
        return (
          <div key={d.mes} className="flex flex-1 flex-col items-center gap-2">
            <span className="text-xs font-medium tabular-nums text-muted">{d.agendamentosConcluidos}</span>
            <div
              className="w-full rounded-t-lg bg-gradient-to-t from-accent-ink to-accent transition-all duration-500"
              style={{ height: `${Math.max((d.agendamentosConcluidos / maior) * 100, 4)}%` }}
            />
            <span className="text-[11px] uppercase text-muted">{rotulo.replace(".", "")}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function Relatorios() {
  const [relatorio, setRelatorio] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    api
      .get("/reports/overview")
      .then(setRelatorio)
      .finally(() => setCarregando(false));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold">Relatórios</h1>
        <p className="mt-1 text-sm text-muted">Como o seu salão está performando.</p>
      </div>

      {carregando ? (
        <>
          <Esqueleto.Cartoes quantidade={2} />
          <Esqueleto linhas={4} />
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CartaoEstatistica icone={UserPlus} rotulo="Clientes novos este mês" valor={relatorio.clientesNovos} />
            <CartaoEstatistica icone={UserX} rotulo="Clientes que sumiram (60+ dias)" valor={relatorio.clientesPerdidos.length} />
          </div>

          <Cartao>
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent-ink" />
              <h2 className="text-sm font-semibold text-muted">Crescimento mensal — agendamentos finalizados</h2>
            </div>
            <GraficoCrescimento dados={relatorio.crescimentoMensal} />
          </Cartao>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Cartao>
              <h2 className="mb-4 text-sm font-semibold text-muted">Serviços mais vendidos (este mês)</h2>
              <ListaRanking itens={relatorio.servicosMaisVendidos} vazio="Nenhum serviço finalizado este mês ainda." />
            </Cartao>
            <Cartao>
              <h2 className="mb-4 text-sm font-semibold text-muted">Profissionais em destaque (este mês)</h2>
              <ListaRanking itens={relatorio.profissionaisDestaque} vazio="Nenhum atendimento finalizado este mês ainda." />
            </Cartao>
          </div>

          <Cartao>
            <h2 className="mb-4 text-sm font-semibold text-muted">Clientes que sumiram</h2>
            {relatorio.clientesPerdidos.length === 0 ? (
              <Mensagem tipo="sucesso" texto="Nenhum cliente parado há mais de 60 dias — ótimo sinal." />
            ) : (
              <ul className="divide-y divide-line">
                {relatorio.clientesPerdidos.map((c) => (
                  <li key={c.id} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="font-medium">{c.nome}</span>
                    <span className="text-muted">
                      {c.ultimoAgendamentoEm ? `Último em ${formatarDataHora(c.ultimoAgendamentoEm)}` : "Nunca agendou"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Cartao>
        </>
      )}
    </div>
  );
}
