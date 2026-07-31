// Vocabulário único de planos da plataforma. Sem cobrança real ainda — o
// Mestre define o plano na hora de cadastrar/editar o salão, e essas flags
// decidem o que cada salão pode usar.
export const PLANOS = ["START", "PRO", "PREMIUM"];

export const RECURSOS_PLANO = {
  START: {
    templateExclusivo: false, // landing padrão, igual pra todo mundo
    personalizacaoCompleta: false,
  },
  PRO: {
    templateExclusivo: true, // landing exclusiva do segmento (blocos)
    personalizacaoCompleta: false,
  },
  PREMIUM: {
    templateExclusivo: true,
    personalizacaoCompleta: true, // pode sobrescrever copy/ordem/cores dos blocos
  },
};

export function recursosDoPlano(plano) {
  return RECURSOS_PLANO[plano] || RECURSOS_PLANO.START;
}
