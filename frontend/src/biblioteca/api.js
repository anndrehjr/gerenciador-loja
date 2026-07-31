const URL_BASE = "/api";

class ErroApi extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function requisitar(caminho, opcoes = {}) {
  const res = await fetch(`${URL_BASE}${caminho}`, {
    credentials: "include",
    headers: opcoes.body ? { "Content-Type": "application/json" } : undefined,
    ...opcoes,
  });

  if (res.status === 204) return null;

  const dados = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ErroApi(res.status, dados?.error || "Erro inesperado.");
  }

  return dados;
}

export const api = {
  get: (caminho) => requisitar(caminho),
  post: (caminho, corpo) => requisitar(caminho, { method: "POST", body: JSON.stringify(corpo) }),
  put: (caminho, corpo) => requisitar(caminho, { method: "PUT", body: JSON.stringify(corpo) }),
  patch: (caminho, corpo) => requisitar(caminho, { method: "PATCH", body: JSON.stringify(corpo) }),
  delete: (caminho) => requisitar(caminho, { method: "DELETE" }),
};

export { ErroApi };
