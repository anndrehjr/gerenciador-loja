import { useState } from "react";
import { Link } from "react-router-dom";
import { Scissors, Mail, ArrowLeft } from "lucide-react";
import { api } from "../../biblioteca/api.js";
import CampoTexto from "../../componentes/ui/CampoTexto.jsx";
import Botao from "../../componentes/ui/Botao.jsx";
import Mensagem from "../../componentes/ui/Mensagem.jsx";

export default function EsqueciSenha() {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setEnviando(true);
    try {
      await api.post("/auth/esqueci-senha", { email });
    } finally {
      // Sempre mostra a mesma mensagem, exista ou não o e-mail — o backend
      // já responde 204 nos dois casos de propósito (não dá pra usar essa
      // tela pra descobrir quem tem conta).
      setEnviando(false);
      setEnviado(true);
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
          <h1 className="text-lg font-semibold">Esqueci minha senha</h1>
          <p className="text-sm text-muted">Informe seu e-mail pra receber o link de redefinição.</p>
        </div>

        {enviado ? (
          <Mensagem
            tipo="sucesso"
            titulo="Se esse e-mail tiver conta, enviamos um link"
            texto="Confira sua caixa de entrada. O link vale por 1 hora."
          />
        ) : (
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
            <Botao type="submit" disabled={enviando} className="mt-2 w-full">
              <Mail className="h-4 w-4" />
              {enviando ? "Enviando…" : "Enviar link"}
            </Botao>
          </form>
        )}

        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-muted">
          <Link to="/login" className="inline-flex items-center gap-1 hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  );
}
