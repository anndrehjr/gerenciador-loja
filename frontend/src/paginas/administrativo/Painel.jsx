import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Scissors, CalendarClock, Plus } from "lucide-react";
import { api } from "../../biblioteca/api.js";
import { formatarDataHora, ROTULOS_STATUS } from "../../biblioteca/formatacao.js";
import CartaoEstatistica from "../../componentes/ui/CartaoEstatistica.jsx";
import Esqueleto from "../../componentes/ui/Esqueleto.jsx";
import Mensagem from "../../componentes/ui/Mensagem.jsx";
import Etiqueta from "../../componentes/ui/Etiqueta.jsx";
import Botao from "../../componentes/ui/Botao.jsx";

const VARIANTE_ETIQUETA_STATUS = {
  AGENDADO: "neutro",
  CONFIRMADO: "accent",
  EM_ATENDIMENTO: "alerta",
  CONCLUIDO: "sucesso",
  CANCELADO: "erro",
};

export default function Painel() {
  const [clientes, setClientes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/clients"), api.get("/services"), api.get("/appointments")])
      .then(([c, s, a]) => {
        setClientes(c);
        setServicos(s);
        setAgendamentos(a);
      })
      .finally(() => setCarregando(false));
  }, []);

  const proximos = agendamentos
    .filter((a) => a.status === "AGENDADO" || a.status === "CONFIRMADO")
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-lg font-semibold">Painel</h1>
        <p className="mt-1 text-sm text-muted">Visão geral do seu salão.</p>
      </div>

      {carregando ? (
        <Esqueleto.Cartoes quantidade={3} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <CartaoEstatistica icone={Users} rotulo="Clientes" valor={clientes.length} />
          <CartaoEstatistica icone={Scissors} rotulo="Serviços" valor={servicos.length} />
          <CartaoEstatistica icone={CalendarClock} rotulo="Agendamentos" valor={agendamentos.length} />
        </div>
      )}

      {carregando ? (
        <Esqueleto linhas={4} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <div className="flex items-center justify-between px-5 py-4">
            <h2 className="text-sm font-semibold text-muted">Próximos agendamentos</h2>
            <Link to="/appointments" className="text-sm text-accent-ink hover:underline">
              Ver todos
            </Link>
          </div>

          {proximos.length === 0 ? (
            <Mensagem
              tipo="vazio"
              titulo="Nenhum agendamento pendente"
              texto="Quando um cliente agendar um horário, ele aparece aqui."
              acao={
                <Link to="/appointments">
                  <Botao className="px-3.5 py-2 text-xs">
                    <Plus className="h-3.5 w-3.5" />
                    Novo agendamento
                  </Botao>
                </Link>
              }
              className="m-5 mt-0"
            />
          ) : (
            <ul className="divide-y divide-line">
              {proximos.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-4 px-5 py-3 text-sm transition duration-200 hover:bg-hover"
                >
                  <div>
                    <div className="font-medium">{a.cliente.nome}</div>
                    <div className="text-muted">{a.servico.nome}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="tabular-nums text-muted">{formatarDataHora(a.data)}</span>
                    <Etiqueta variante={VARIANTE_ETIQUETA_STATUS[a.status]}>{ROTULOS_STATUS[a.status]}</Etiqueta>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
