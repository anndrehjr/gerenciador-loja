import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Scissors, LogIn } from "lucide-react";
import { useAutenticacao } from "../../contextos/ContextoAutenticacao.jsx";
import CampoTexto from "../../componentes/ui/CampoTexto.jsx";
import Botao from "../../componentes/ui/Botao.jsx";

// Login da equipe da plataforma (Painel Master). O login de cada salão
// cliente fica em /:salaoId/login (LoginSalao.jsx), com a marca do salão.
export default function LoginMestre() {
  const { login } = useAutenticacao();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    try {
      const usuarioLogado = await login(email, senha);
      navigate(usuarioLogado.papel === "MESTRE" ? "/master" : "/dashboard", { replace: true });
    } catch (err) {
      setErro(err.message || "Falha no login.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg px-6 text-ink">
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-gradient-to-br from-accent/20 to-accent-ink/10 blur-3xl" />

      <div className="relative w-full max-w-sm rounded-3xl border border-line bg-surface p-8 shadow-soft">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-ink">
            <Scissors className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-lg font-semibold">Entrar</h1>
          <p className="text-sm text-muted">Acesso restrito à equipe da plataforma.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <CampoTexto
            id="email"
            rotulo="Email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <CampoTexto
            id="senha"
            rotulo="Senha"
            type="password"
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />

          {erro && <p className="text-sm text-critical" role="alert">{erro}</p>}

          <Botao type="submit" disabled={carregando} className="mt-2 w-full">
            <LogIn className="h-4 w-4" />
            {carregando ? "Entrando…" : "Entrar"}
          </Botao>
        </form>

        <p className="mt-6 text-center text-xs text-muted">
          <Link to="/esqueci-senha" className="hover:underline">
            Esqueci minha senha
          </Link>
        </p>
      </div>
    </div>
  );
}
