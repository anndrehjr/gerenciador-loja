const LIMITE_PADRAO = 100;
const LIMITE_MAXIMO = 200;

// Não muda o formato da resposta (continua um array puro) — só limita o
// tamanho por padrão e expõe o total via header `X-Total-Count`. Uma tela
// que nunca pediu paginação continua funcionando exatamente igual, só passa
// a ter um teto de segurança em vez de devolver a tabela inteira sempre.
export function parsePaginacao(query) {
  const pagina = Math.max(1, parseInt(query.pagina, 10) || 1);
  const limite = Math.min(LIMITE_MAXIMO, Math.max(1, parseInt(query.limite, 10) || LIMITE_PADRAO));
  return { pagina, limite, skip: (pagina - 1) * limite, take: limite };
}

export function definirCabecalhoTotal(res, total) {
  res.set("X-Total-Count", String(total));
}
