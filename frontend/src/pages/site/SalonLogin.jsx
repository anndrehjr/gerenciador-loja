import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Scissors, LogIn } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useSalon } from "../../contexts/SalonContext.jsx";
import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";

// Login administrativo de um salão específico (/:salonId/login), com a
// marca (logo/cor) daquele salão.
export default function SalonLogin() {
  const { login } = useAuth();
  const { salon, path } = useSalon();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const loggedInUser = await login(email, password);
      navigate(loggedInUser.role === "MASTER" ? "/master" : "/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Falha no login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg px-6 text-ink">
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-gradient-to-br from-accent/20 to-accent-ink/10 blur-3xl" />

      <div className="relative w-full max-w-sm rounded-3xl border border-line bg-surface p-8 shadow-soft">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          {salon?.logoUrl ? (
            <img src={salon.logoUrl} alt={salon.name} className="h-11 w-11 rounded-2xl object-cover" />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-ink">
              <Scissors className="h-5 w-5 text-white" />
            </div>
          )}
          <h1 className="text-lg font-semibold">Entrar</h1>
          <p className="text-sm text-muted">
            Acesso restrito à administração {salon?.name ? `de ${salon.name}` : "do salão"}.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="email"
            label="Email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            id="password"
            label="Senha"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="text-sm text-critical">{error}</p>}

          <Button type="submit" disabled={loading} className="mt-2 w-full">
            <LogIn className="h-4 w-4" />
            {loading ? "Entrando…" : "Entrar"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted">
          <Link to={path("")} className="hover:underline">
            Voltar ao site
          </Link>
        </p>
      </div>
    </div>
  );
}
