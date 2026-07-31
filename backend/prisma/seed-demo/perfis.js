// Perfis de comportamento — é isso que evita a "linha reta"/aleatoriedade
// pura que o pedido explicitamente não queria. Cada cliente sorteia um
// perfil (ponderado) e o gerador de agenda usa ele pra decidir quantas
// visitas gerar nos 24 meses e com que regularidade.

import { escolherPonderado } from "./geradores.js";

export const PERFIS_CLIENTE = [
  // intervaloDias: a cada quantos dias, em média, esse cliente volta.
  // variacao: quanto esse intervalo oscila (fração do intervalo).
  { chave: "fiel_semanal", peso: 8, intervaloDias: 9, variacao: 0.35, chanceSumico: 0.02 },
  { chave: "fiel_quinzenal", peso: 20, intervaloDias: 18, variacao: 0.3, chanceSumico: 0.05 },
  { chave: "mensal", peso: 32, intervaloDias: 32, variacao: 0.3, chanceSumico: 0.12 },
  { chave: "ocasional", peso: 24, intervaloDias: 65, variacao: 0.45, chanceSumico: 0.2 },
  { chave: "sumiu_e_voltou", peso: 10, intervaloDias: 30, variacao: 0.3, chanceSumico: 0.6 },
  { chave: "novato", peso: 6, intervaloDias: 20, variacao: 0.2, chanceSumico: 0.08 },
];

export function sortearPerfilCliente() {
  return escolherPonderado(PERFIS_CLIENTE.map((p) => ({ valor: p, peso: p.peso })));
}

// Distribuição de status de um atendimento já concluído/passado — a imensa
// maioria termina bem, uma fatia pequena cancela ou falta, matching o que
// qualquer salão real vive.
export const DISTRIBUICAO_STATUS_PASSADO = [
  { valor: "CONCLUIDO", peso: 82 },
  { valor: "CANCELADO", peso: 11 },
  { valor: "NAO_COMPARECEU", peso: 7 },
];

export const DISTRIBUICAO_STATUS_FUTURO = [
  { valor: "AGENDADO", peso: 55 },
  { valor: "CONFIRMADO", peso: 45 },
];

export function sortearStatusPassado() {
  return escolherPonderado(DISTRIBUICAO_STATUS_PASSADO);
}

export function sortearStatusFuturo() {
  return escolherPonderado(DISTRIBUICAO_STATUS_FUTURO);
}

export const DISTRIBUICAO_METODO_PAGAMENTO = [
  { valor: "PIX", peso: 45 },
  { valor: "CARTAO", peso: 40 },
  { valor: "DINHEIRO", peso: 15 },
];

export function sortearMetodoPagamento() {
  return escolherPonderado(DISTRIBUICAO_METODO_PAGAMENTO);
}

// Porte da empresa — dirige quantidade de colaboradores/clientes/produtos.
// Faixas dentro do que o pedido descreveu (5-30 usuários, 300-2000 clientes).
export const PORTES_EMPRESA = [
  { chave: "pequeno", peso: 35, usuarios: [5, 8], clientes: [300, 600], plano: "START" },
  { chave: "medio", peso: 40, usuarios: [9, 16], clientes: [600, 1200], plano: "PRO" },
  { chave: "grande", peso: 25, usuarios: [17, 30], clientes: [1200, 2000], plano: "PREMIUM" },
];

export function sortearPorteEmpresa() {
  return escolherPonderado(PORTES_EMPRESA.map((p) => ({ valor: p, peso: p.peso })));
}

// Popularidade relativa de cada profissional dentro do salão — "alguns
// profissionais mais populares" do pedido. Sorteada uma vez por profissional
// no momento da criação, usada como peso na hora de escolher quem atende.
export function sortearPopularidadeProfissional() {
  return escolherPonderado([
    { valor: 0.5, peso: 20 },
    { valor: 1, peso: 45 },
    { valor: 1.8, peso: 25 },
    { valor: 3, peso: 10 },
  ]);
}
