import { Suspense, lazy } from "react";
import { Routes, Route, Navigate, useParams } from "react-router-dom";
import { useAutenticacao } from "./contextos/ContextoAutenticacao.jsx";
import { ProvedorSalao } from "./contextos/ContextoSalao.jsx";
import Carregamento from "./componentes/ui/Carregamento.jsx";

// Code-splitting por grupo de rota (Fase 13): quem só visita a landing
// pública não baixa o painel administrativo nem o painel mestre juntos —
// cada grupo vira um chunk carregado só quando a rota é acessada.
const InicioPlataforma = lazy(() => import("./paginas/site/InicioPlataforma.jsx"));
const PaginaSite = lazy(() => import("./paginas/site/PaginaSite.jsx"));
const AssistenteAgendamento = lazy(() => import("./paginas/site/AssistenteAgendamento.jsx"));
const LoginSalao = lazy(() => import("./paginas/site/LoginSalao.jsx"));
const LoginMestre = lazy(() => import("./paginas/administrativo/LoginMestre.jsx"));
const EsqueciSenha = lazy(() => import("./paginas/site/EsqueciSenha.jsx"));
const TrocarSenha = lazy(() => import("./paginas/site/TrocarSenha.jsx"));
const CriarConta = lazy(() => import("./paginas/site/CriarConta.jsx"));

const LayoutAdministrativo = lazy(() => import("./paginas/administrativo/LayoutAdministrativo.jsx"));
const Painel = lazy(() => import("./paginas/administrativo/Painel.jsx"));
const Clientes = lazy(() => import("./paginas/administrativo/Clientes.jsx"));
const DetalheCliente = lazy(() => import("./paginas/administrativo/DetalheCliente.jsx"));
const Servicos = lazy(() => import("./paginas/administrativo/Servicos.jsx"));
const Profissionais = lazy(() => import("./paginas/administrativo/Profissionais.jsx"));
const Agendamentos = lazy(() => import("./paginas/administrativo/Agendamentos.jsx"));
const Equipe = lazy(() => import("./paginas/administrativo/Equipe.jsx"));
const Financeiro = lazy(() => import("./paginas/administrativo/Financeiro.jsx"));
const Estoque = lazy(() => import("./paginas/administrativo/Estoque.jsx"));
const Relatorios = lazy(() => import("./paginas/administrativo/Relatorios.jsx"));
const Configuracoes = lazy(() => import("./paginas/administrativo/Configuracoes.jsx"));

const LayoutMestre = lazy(() => import("./paginas/mestre/LayoutMestre.jsx"));
const PainelMestre = lazy(() => import("./paginas/mestre/PainelMestre.jsx"));
const CriarSalao = lazy(() => import("./paginas/mestre/CriarSalao.jsx"));
const Planos = lazy(() => import("./paginas/mestre/Planos.jsx"));

function CarregandoPagina() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Carregamento texto="Carregando…" />
    </div>
  );
}

function RotaProtegida({ children }) {
  const { autenticado, carregando, usuario } = useAutenticacao();

  if (carregando) {
    return <div className="flex min-h-screen items-center justify-center text-muted">Carregando…</div>;
  }
  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }
  if (usuario.papel === "MESTRE") {
    return <Navigate to="/master" replace />;
  }
  return children;
}

function RotaMestre({ children }) {
  const { autenticado, carregando, usuario } = useAutenticacao();

  if (carregando) {
    return <div className="flex min-h-screen items-center justify-center text-muted">Carregando…</div>;
  }
  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }
  if (usuario.papel !== "MESTRE") {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

// Lê o :salaoId da URL (rotas /:salaoId/...) e monta o contexto do salão
// pra tudo que estiver dentro — site público, agendamento, login com marca.
function RotaSalao({ children }) {
  const { salaoId } = useParams();
  return <ProvedorSalao salaoId={salaoId}>{children}</ProvedorSalao>;
}

export default function App() {
  return (
    <Suspense fallback={<CarregandoPagina />}>
      <Routes>
        <Route path="/" element={<InicioPlataforma />} />
        <Route path="/login" element={<LoginMestre />} />
        <Route path="/esqueci-senha" element={<EsqueciSenha />} />
        <Route path="/trocar-senha" element={<TrocarSenha />} />
        <Route path="/criar-conta" element={<CriarConta />} />

        <Route path="/:salaoId" element={<RotaSalao><PaginaSite /></RotaSalao>} />
        <Route path="/:salaoId/agendar" element={<RotaSalao><AssistenteAgendamento /></RotaSalao>} />
        <Route path="/:salaoId/login" element={<RotaSalao><LoginSalao /></RotaSalao>} />

        <Route
          element={
            <RotaProtegida>
              <LayoutAdministrativo />
            </RotaProtegida>
          }
        >
          <Route path="/dashboard" element={<Painel />} />
          <Route path="/clients" element={<Clientes />} />
          <Route path="/clients/:id" element={<DetalheCliente />} />
          <Route path="/services" element={<Servicos />} />
          <Route path="/professionals" element={<Profissionais />} />
          <Route path="/appointments" element={<Agendamentos />} />
          <Route path="/team" element={<Equipe />} />
          <Route path="/finance" element={<Financeiro />} />
          <Route path="/inventory" element={<Estoque />} />
          <Route path="/reports" element={<Relatorios />} />
          <Route path="/settings" element={<Configuracoes />} />
        </Route>

        <Route
          element={
            <RotaMestre>
              <LayoutMestre />
            </RotaMestre>
          }
        >
          <Route path="/master" element={<PainelMestre />} />
          <Route path="/master/salons/new" element={<CriarSalao />} />
          <Route path="/master/salons/:id" element={<PainelMestre />} />
          <Route path="/master/plans" element={<Planos />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
