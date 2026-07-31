// Espelha backend/src/biblioteca/planos.js — mesmo vocabulário dos dois lados.
export const PLANOS = ["START", "PRO", "PREMIUM"];

export const RECURSOS_PLANO = {
  START: { templateExclusivo: false, personalizacaoCompleta: false },
  PRO: { templateExclusivo: true, personalizacaoCompleta: false },
  PREMIUM: { templateExclusivo: true, personalizacaoCompleta: true },
};

export function recursosDoPlano(plano) {
  return RECURSOS_PLANO[plano] || RECURSOS_PLANO.START;
}

export const INFO_PLANO = {
  START: {
    rotulo: "Start",
    slogan: "Pra começar a receber agendamentos online.",
    recursos: ["Landing page padrão", "Painel administrativo completo", "Agendamento online", "Suporte por email"],
  },
  PRO: {
    rotulo: "Pro",
    slogan: "Landing exclusiva pro seu segmento.",
    recursos: [
      "Tudo do Start",
      "Landing page exclusiva do seu tipo de negócio",
      "Vitrine de serviços em carrossel",
      "Suporte prioritário",
    ],
    destaque: true,
  },
  PREMIUM: {
    rotulo: "Premium",
    slogan: "Personalização completa, sem mexer em código.",
    recursos: [
      "Tudo do Pro",
      "Editar cada seção da landing pelo painel",
      "Cores, textos e ordem das seções livres",
      "Suporte dedicado",
    ],
  },
};
