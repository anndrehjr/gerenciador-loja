// Cada template define só a cor de destaque do site público e da tela de
// login de um salão (--accent / --accent-ink, no mesmo formato "R G B" usado
// em index.css) — o resto do layout (tipografia, espaçamento, dark mode)
// continua igual pra todos, é só a cor que muda.
export const TEMPLATES = {
  "beauty-luxury": {
    label: "Beauty Luxury",
    description: "Rosé e dourado — elegante, visual feminino.",
    accent: "199 120 130",
    accentInk: "173 133 66",
    swatch: "#c77882",
  },
  "premium-barber": {
    label: "Premium Barber",
    description: "Preto e bronze — sóbrio, visual masculino.",
    accent: "120 92 58",
    accentInk: "191 161 105",
    swatch: "#785c3a",
  },
  "minimal-studio": {
    label: "Minimal Studio",
    description: "Violeta — minimalista, unissex (padrão).",
    accent: "139 92 246",
    accentInk: "124 58 237",
    swatch: "#8b5cf6",
  },
  "spa-zen": {
    label: "Spa Zen",
    description: "Verde-sálvia e bege — leve, tranquilo.",
    accent: "125 148 118",
    accentInk: "150 130 88",
    swatch: "#7d9476",
  },
};

export const DEFAULT_TEMPLATE = "minimal-studio";

export function hexToRgbTriplet(hex) {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!match) return null;
  const int = parseInt(match[1], 16);
  return `${(int >> 16) & 255} ${(int >> 8) & 255} ${int & 255}`;
}

// Resolve as variáveis CSS de cor pra um salão: um primaryColor customizado
// sempre vence o template; sem nenhum dos dois, cai no template padrão.
export function resolveSalonColors(salon) {
  if (salon?.primaryColor) {
    const rgb = hexToRgbTriplet(salon.primaryColor);
    if (rgb) return { accent: rgb, accentInk: rgb };
  }
  const template = TEMPLATES[salon?.template] || TEMPLATES[DEFAULT_TEMPLATE];
  return { accent: template.accent, accentInk: template.accentInk };
}
