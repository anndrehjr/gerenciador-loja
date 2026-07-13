// Landing exclusiva por segmento (planos PRO/PREMIUM) — cada categoria tem
// paleta, tipografia e copy padrão próprios, mas todas são montadas com o
// mesmo conjunto de blocos (ver components/blocks). É assim que dá pra
// existir "5 sites diferentes" sem manter 5 projetos diferentes: o que muda
// é a config, não o código do bloco.
export const BLOCK_ORDER = [
  "hero",
  "about",
  "services",
  "team",
  "gallery",
  "reviews",
  "instagram",
  "faq",
  "contact",
  "footer",
];

const DEFAULT_FAQ = [
  {
    q: "Como funciona o agendamento?",
    a: "É só escolher o serviço, o profissional e o horário — a confirmação é na hora, sem precisar ligar.",
  },
  {
    q: "Preciso pagar pra reservar o horário?",
    a: "Não, o pagamento é feito no salão, no dia do atendimento.",
  },
  {
    q: "Posso remarcar ou cancelar?",
    a: "Sim, entre em contato pelo WhatsApp com a maior antecedência possível.",
  },
];

export const CATEGORY_TEMPLATES = {
  FEMININO: {
    label: "Salão Feminino",
    fontDisplay: "'Cormorant Garamond', serif",
    fontBody: "'Inter', sans-serif",
    palette: {
      bg: "252 245 248",
      surface: "255 255 255",
      hover: "250 240 245",
      ink: "48 32 40",
      muted: "134 108 118",
      line: "238 221 229",
      accent: "201 81 143",
      accentInk: "150 47 100",
    },
    heroVariant: "centered",
    copy: {
      eyebrow: "Salão de beleza",
      heroHeadline: "Beleza que é só sua.",
      heroSubheadline: "Cortes, coloração e tratamentos num espaço pensado pra você se sentir bem em cada detalhe.",
      aboutTitle: "Sobre",
      aboutText:
        "Cuidamos de cada cliente com atenção e tempo — do primeiro corte ao tratamento mais elaborado, sempre com produtos de qualidade e uma equipe apaixonada pelo que faz.",
      faq: DEFAULT_FAQ,
    },
  },
  BARBEARIA: {
    label: "Barbearia",
    fontDisplay: "'Oswald', sans-serif",
    fontBody: "'Inter', sans-serif",
    palette: {
      bg: "20 18 16",
      surface: "30 26 22",
      hover: "40 34 28",
      ink: "240 235 228",
      muted: "158 145 130",
      line: "56 48 40",
      accent: "181 121 58",
      accentInk: "212 158 92",
    },
    heroVariant: "split",
    copy: {
      eyebrow: "Barbearia",
      heroHeadline: "CORTE. BARBA. ESTILO.",
      heroSubheadline: "Tradição e precisão em cada atendimento — sua barbearia de confiança, sem hora marcada complicada.",
      aboutTitle: "A casa",
      aboutText:
        "Ambiente pensado pra você relaxar enquanto cuida do visual. Navalha, técnica e atenção aos detalhes em cada corte e barba.",
      faq: DEFAULT_FAQ,
    },
  },
  UNISSEX: {
    label: "Unissex",
    fontDisplay: "'Inter', sans-serif",
    fontBody: "'Inter', sans-serif",
    palette: {
      bg: "250 250 251",
      surface: "255 255 255",
      hover: "244 244 246",
      ink: "24 24 27",
      muted: "113 113 122",
      line: "228 228 231",
      accent: "82 82 91",
      accentInk: "39 39 42",
    },
    heroVariant: "centered",
    copy: {
      eyebrow: "Salão unissex",
      heroHeadline: "Cuidado pra todo mundo.",
      heroSubheadline: "Um espaço pra qualquer pessoa cuidar do visual, com agenda flexível e equipe versátil.",
      aboutTitle: "Sobre",
      aboutText: "Atendemos com o mesmo cuidado independente do estilo que você procura — a agenda é sua.",
      faq: DEFAULT_FAQ,
    },
  },
  ESTETICA: {
    label: "Clínica de Estética",
    fontDisplay: "'Manrope', sans-serif",
    fontBody: "'Inter', sans-serif",
    palette: {
      bg: "247 249 252",
      surface: "255 255 255",
      hover: "240 244 250",
      ink: "30 32 41",
      muted: "108 116 133",
      line: "224 229 240",
      accent: "91 127 199",
      accentInk: "63 92 156",
    },
    heroVariant: "split",
    copy: {
      eyebrow: "Clínica de estética",
      heroHeadline: "Sua pele, seu tempo.",
      heroSubheadline: "Procedimentos estéticos com técnica e cuidado, num ambiente clean pensado pro seu bem-estar.",
      aboutTitle: "Sobre a clínica",
      aboutText:
        "Protocolos pensados pra cada tipo de pele, com profissionais qualificados e um ambiente tranquilo do início ao fim.",
      faq: DEFAULT_FAQ,
    },
  },
  OUTROS: {
    label: "Outros",
    fontDisplay: "'Inter', sans-serif",
    fontBody: "'Inter', sans-serif",
    palette: {
      bg: "250 250 251",
      surface: "255 255 255",
      hover: "244 244 245",
      ink: "27 25 36",
      muted: "108 103 121",
      line: "227 223 240",
      accent: "124 58 237",
      accentInk: "91 33 182",
    },
    heroVariant: "centered",
    copy: {
      eyebrow: "Agendamento online",
      heroHeadline: "Cuidado e estilo, com hora marcada.",
      heroSubheadline: "Conheça nossos serviços e agende seu horário em poucos cliques.",
      aboutTitle: "Sobre",
      aboutText: "Um espaço pensado pra atender você bem, do agendamento ao atendimento.",
      faq: DEFAULT_FAQ,
    },
  },
};

export function categoryTemplate(category) {
  return CATEGORY_TEMPLATES[category] || CATEGORY_TEMPLATES.OUTROS;
}
