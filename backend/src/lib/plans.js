// Vocabulário único de planos da plataforma. Sem cobrança real ainda — o
// Master define o plano na hora de cadastrar/editar o salão, e essas flags
// decidem o que cada salão pode usar.
export const PLANS = ["START", "PRO", "PREMIUM"];

export const PLAN_FEATURES = {
  START: {
    exclusiveTemplate: false, // landing padrão, igual pra todo mundo
    fullCustomization: false,
  },
  PRO: {
    exclusiveTemplate: true, // landing exclusiva do segmento (blocos)
    fullCustomization: false,
  },
  PREMIUM: {
    exclusiveTemplate: true,
    fullCustomization: true, // pode sobrescrever copy/ordem/cores dos blocos
  },
};

export function planFeatures(plan) {
  return PLAN_FEATURES[plan] || PLAN_FEATURES.START;
}
