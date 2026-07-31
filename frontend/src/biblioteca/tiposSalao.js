import { Sparkles, Scissors, Users, HeartPulse, Store } from "lucide-react";

// Metadata dos 5 segmentos — usada nos cartões de seleção do cadastro
// (CriarSalao) e como chave pra escolher a landing exclusiva (PRO/PREMIUM)
// em frontend/src/biblioteca/modelosPorCategoria.js.
export const TIPOS_SALAO = [
  {
    id: "FEMININO",
    rotulo: "Salão Feminino",
    descricao: "Cortes, coloração, tratamentos capilares e estética feminina.",
    icone: Sparkles,
    accent: "#c9518f",
    gradient: "linear-gradient(135deg, #f7d9e7 0%, #d8a6c4 50%, #b98a5e 100%)",
  },
  {
    id: "BARBEARIA",
    rotulo: "Barbearia",
    descricao: "Corte masculino, barba, navalha e visagismo.",
    icone: Scissors,
    accent: "#b5793a",
    gradient: "linear-gradient(135deg, #2b2420 0%, #4a3826 50%, #8a6a3e 100%)",
  },
  {
    id: "UNISSEX",
    rotulo: "Unissex",
    descricao: "Atende todos os públicos, com agenda compartilhada.",
    icone: Users,
    accent: "#5b5b66",
    gradient: "linear-gradient(135deg, #f2f2f5 0%, #cfcfd8 50%, #8f8f9c 100%)",
  },
  {
    id: "ESTETICA",
    rotulo: "Clínica de Estética",
    descricao: "Procedimentos estéticos, skincare e bem-estar.",
    icone: HeartPulse,
    accent: "#5b7fc7",
    gradient: "linear-gradient(135deg, #eaf1fc 0%, #cdd9f5 50%, #b9a9e0 100%)",
  },
  {
    id: "OUTROS",
    rotulo: "Outros",
    descricao: "Qualquer outro tipo de negócio de beleza ou bem-estar.",
    icone: Store,
    accent: "#6b6b6b",
    gradient: "linear-gradient(135deg, #ececec 0%, #d4d4d4 50%, #a8a8a8 100%)",
  },
];

export function infoTipoSalao(id) {
  return TIPOS_SALAO.find((t) => t.id === id) || TIPOS_SALAO[TIPOS_SALAO.length - 1];
}
