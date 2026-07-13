// Espelha backend/src/lib/plans.js — mesmo vocabulário dos dois lados.
export const PLANS = ["START", "PRO", "PREMIUM"];

export const PLAN_FEATURES = {
  START: { exclusiveTemplate: false, fullCustomization: false },
  PRO: { exclusiveTemplate: true, fullCustomization: false },
  PREMIUM: { exclusiveTemplate: true, fullCustomization: true },
};

export function planFeatures(plan) {
  return PLAN_FEATURES[plan] || PLAN_FEATURES.START;
}

export const PLAN_INFO = {
  START: {
    label: "Start",
    tagline: "Pra começar a receber agendamentos online.",
    features: ["Landing page padrão", "Painel administrativo completo", "Agendamento online", "Suporte por email"],
  },
  PRO: {
    label: "Pro",
    tagline: "Landing exclusiva pro seu segmento.",
    features: [
      "Tudo do Start",
      "Landing page exclusiva do seu tipo de negócio",
      "Vitrine de serviços em carrossel",
      "Suporte prioritário",
    ],
    highlight: true,
  },
  PREMIUM: {
    label: "Premium",
    tagline: "Personalização completa, sem mexer em código.",
    features: [
      "Tudo do Pro",
      "Editar cada seção da landing pelo painel",
      "Cores, textos e ordem das seções livres",
      "Suporte dedicado",
    ],
  },
};
