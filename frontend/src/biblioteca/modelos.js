// Cada modelo define pelo menos a cor de destaque do site público e da tela
// de login de um salão (--accent / --accent-ink, no mesmo formato "R G B"
// usado em index.css). Os 4 primeiros só trocam a cor — o resto do layout
// (tipografia, fundo, dark mode) continua igual pra todos. "vitrine-elegante"
// é o primeiro modelo que também troca fundo/superfície/tipografia inteiros
// (paleta creme + dourado, tipografia serifada), aplicado via resolverTemaSalao.
export const MODELOS = {
  "beauty-luxury": {
    rotulo: "Beauty Luxury",
    descricao: "Rosé e dourado — elegante, visual feminino.",
    accent: "199 120 130",
    accentInk: "173 133 66",
    swatch: "#c77882",
  },
  "premium-barber": {
    rotulo: "Premium Barber",
    descricao: "Preto e bronze — sóbrio, visual masculino.",
    accent: "120 92 58",
    accentInk: "191 161 105",
    swatch: "#785c3a",
  },
  "minimal-studio": {
    rotulo: "Minimal Studio",
    descricao: "Violeta — minimalista, unissex (padrão).",
    accent: "139 92 246",
    accentInk: "124 58 237",
    swatch: "#8b5cf6",
  },
  "spa-zen": {
    rotulo: "Spa Zen",
    descricao: "Verde-sálvia e bege — leve, tranquilo.",
    accent: "125 148 118",
    accentInk: "150 130 88",
    swatch: "#7d9476",
  },
  "vitrine-elegante": {
    rotulo: "Vitrine Elegante",
    descricao: "Creme e dourado — boutique, tipografia serifada.",
    accent: "196 152 88",
    accentInk: "150 108 58",
    swatch: "#c49858",
    bg: "253 250 244",
    surface: "255 253 249",
    hover: "246 241 232",
    ink: "43 38 32",
    muted: "117 108 97",
    line: "231 223 209",
    fonteSans: "'Karla', ui-sans-serif, system-ui, sans-serif",
    fonteDisplay: "'Cormorant Garamond', serif",
  },
};

export const MODELO_PADRAO = "minimal-studio";

export function hexParaRgb(hex) {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!match) return null;
  const int = parseInt(match[1], 16);
  return `${(int >> 16) & 255} ${(int >> 8) & 255} ${int & 255}`;
}

// Resolve o tema completo pra um salão: uma corPrimaria customizada sempre
// vence a cor do modelo (mas não o resto da paleta, se o modelo definir uma);
// sem nenhum dos dois, cai no modelo padrão. Os campos extras (bg/surface/
// hover/ink/muted/line/fonteSans) vêm undefined pros modelos que não os
// definem — ContextoSalao só aplica a CSS var quando o valor existe, então
// esses salões continuam herdando o tema claro/escuro padrão normalmente.
export function resolverTemaSalao(salao) {
  const modelo = MODELOS[salao?.template] || MODELOS[MODELO_PADRAO];

  let accent = modelo.accent;
  let accentInk = modelo.accentInk;
  if (salao?.corPrimaria) {
    const rgb = hexParaRgb(salao.corPrimaria);
    if (rgb) {
      accent = rgb;
      accentInk = rgb;
    }
  }

  return {
    accent,
    accentInk,
    bg: modelo.bg,
    surface: modelo.surface,
    hover: modelo.hover,
    ink: modelo.ink,
    muted: modelo.muted,
    line: modelo.line,
    fonteSans: modelo.fonteSans,
    fonteDisplay: modelo.fonteDisplay,
  };
}
