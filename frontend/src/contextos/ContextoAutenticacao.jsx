import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../biblioteca/api.js";

const ContextoAutenticacao = createContext(null);

export function ProvedorAutenticacao({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    api
      .get("/auth/me")
      .then(setUsuario)
      .catch(() => setUsuario(null))
      .finally(() => setCarregando(false));
  }, []);

  async function login(email, senha) {
    const usuarioLogado = await api.post("/auth/login", { email, senha });
    setUsuario(usuarioLogado);
    return usuarioLogado;
  }

  // Cadastro público (Fase 6) — POST /api/signup já deixa a sessão criada
  // (mesmo cookie do login), então só precisa espelhar o usuário no contexto,
  // sem precisar de um segundo request de login logo em seguida.
  async function cadastrar(dados) {
    const usuarioCriado = await api.post("/signup", dados);
    setUsuario(usuarioCriado);
    return usuarioCriado;
  }

  async function logout() {
    await api.post("/auth/logout", {}).catch(() => {});
    setUsuario(null);
  }

  return (
    <ContextoAutenticacao.Provider value={{ usuario, carregando, autenticado: !!usuario, login, cadastrar, logout }}>
      {children}
    </ContextoAutenticacao.Provider>
  );
}

export function useAutenticacao() {
  const ctx = useContext(ContextoAutenticacao);
  if (!ctx) throw new Error("useAutenticacao deve ser usado dentro de ProvedorAutenticacao");
  return ctx;
}
