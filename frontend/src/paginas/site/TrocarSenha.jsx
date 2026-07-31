import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Scissors, KeyRound } from "lucide-react";
import { api } from "../../biblioteca/api.js";
import { mostrarMensagem } from "../../contextos/ContextoNotificacoes.jsx";
import CampoTexto from "../../componentes/ui/CampoTexto.jsx";
import Botao from "../../componentes/ui/Botao.jsx";
import Mensagem from "../../componentes/ui/Mensagem.jsx";

export default function TrocarSenha() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    if (novaSenha !== confirmacao) {
      setErro("As senhas não coincidem.");
      return;
    }
    setEnviando(true);
    try {
      await api.post("/auth/trocar-senha", { token, novaSenha });
      mostrarMensagem({ tipo: "sucesso", texto: "Senha redefinida. Entre com a nova senha." });
      navigate("/login", { replace: true });
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
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
          <h1 className="text-lg font-semibold">Nova senha</h1>
          <p className="text-sm text-muted">Escolha uma nova senha de acesso.</p>
        </div>

        {!token ? (
          <Mensagem
            tipo="erro"
            titulo="Link inválido"
            texto="Peça um novo link na tela de login."
            acao={
              <Link to="/esqueci-senha">
                <Botao variante="ghost" className="px-3.5 py-2 text-xs">
                  Solicitar novo link
                </Botao>
              </Link>
            }
          />
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <CampoTexto
              id="novaSenha"
              rotulo="Nova senha"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              required
            />
            <CampoTexto
              id="confirmacao"
              rotulo="Confirmar nova senha"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
              required
            />

            {erro && <p className="text-sm text-critical">{erro}</p>}

            <Botao type="submit" disabled={enviando} className="mt-2 w-full">
              <KeyRound className="h-4 w-4" />
              {enviando ? "Salvando…" : "Salvar nova senha"}
            </Botao>
          </form>
        )}
      </div>
    </div>
  );
}
