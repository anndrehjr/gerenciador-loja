import { useAuth } from "../../contexts/AuthContext.jsx";

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold">Configurações</h1>

      <div className="max-w-md rounded-2xl border border-line bg-surface p-6 shadow-soft">
        <h2 className="text-sm font-semibold text-muted">Conta</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Nome</dt>
            <dd>{user?.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Email</dt>
            <dd>{user?.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Perfil</dt>
            <dd>{user?.role}</dd>
          </div>
        </dl>
      </div>

      <p className="text-xs text-muted">Gerenciador de Salão — v1.0.0</p>
    </div>
  );
}
