import { ambiente } from "../configuracao/ambiente.js";

// Adaptador de cobrança (Fase 11) — a interface que qualquer gateway precisa
// implementar. Hoje só existe o adaptador "manual" (o que já acontece: o
// Mestre ativa/edita `Assinatura` na mão pelo Painel Mestre). Plugar
// Stripe/Mercado Pago/Pagar.me de verdade é:
//   1. implementar essa mesma interface (criarSessaoCheckout/cancelar/
//      sincronizarStatus) num adaptador novo, chamando o SDK do provedor;
//   2. registrar em ADAPTADORES;
//   3. apontar GATEWAY_COBRANCA pro nome do adaptador no .env.
// Nenhum outro lugar do código (controladores, rotas) precisa mudar —
// eles sempre falam com obterAdaptadorCobranca(), nunca com um SDK direto.
const adaptadorManual = {
  nome: "manual",

  // Um checkout de verdade devolveria a URL de pagamento do provedor.
  async criarSessaoCheckout() {
    throw new Error(
      "Cobrança automática não está configurada nesta instalação. Gerencie o plano manualmente pelo Painel Mestre."
    );
  },

  // Cancelamento manual é só mudar Assinatura.status pelo Painel Mestre —
  // não há nada externo pra sincronizar.
  async cancelar() {},

  // Um adaptador real receberia um webhook do provedor aqui e atualizaria
  // Assinatura/Fatura de acordo. O manual não tem o que sincronizar sozinho.
  async sincronizarStatus() {},
};

const ADAPTADORES = { manual: adaptadorManual };

export function obterAdaptadorCobranca() {
  return ADAPTADORES[ambiente.GATEWAY_COBRANCA] || adaptadorManual;
}
