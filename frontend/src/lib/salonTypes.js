import { Sparkles, Scissors, Users, HeartPulse, Store } from "lucide-react";

// Metadata dos 5 segmentos — usada nos cartões de seleção do cadastro
// (CreateSalon) e como chave pra escolher a landing exclusiva (PRO/PREMIUM)
// em frontend/src/lib/landingTemplates.js.
export const SALON_TYPES = [
  {
    id: "FEMININO",
    label: "Salão Feminino",
    description: "Cortes, coloração, tratamentos capilares e estética feminina.",
    icon: Sparkles,
    accent: "#c9518f",
    gradient: "linear-gradient(135deg, #f7d9e7 0%, #d8a6c4 50%, #b98a5e 100%)",
  },
  {
    id: "BARBEARIA",
    label: "Barbearia",
    description: "Corte masculino, barba, navalha e visagismo.",
    icon: Scissors,
    accent: "#b5793a",
    gradient: "linear-gradient(135deg, #2b2420 0%, #4a3826 50%, #8a6a3e 100%)",
  },
  {
    id: "UNISSEX",
    label: "Unissex",
    description: "Atende todos os públicos, com agenda compartilhada.",
    icon: Users,
    accent: "#5b5b66",
    gradient: "linear-gradient(135deg, #f2f2f5 0%, #cfcfd8 50%, #8f8f9c 100%)",
  },
  {
    id: "ESTETICA",
    label: "Clínica de Estética",
    description: "Procedimentos estéticos, skincare e bem-estar.",
    icon: HeartPulse,
    accent: "#5b7fc7",
    gradient: "linear-gradient(135deg, #eaf1fc 0%, #cdd9f5 50%, #b9a9e0 100%)",
  },
  {
    id: "OUTROS",
    label: "Outros",
    description: "Qualquer outro tipo de negócio de beleza ou bem-estar.",
    icon: Store,
    accent: "#6b6b6b",
    gradient: "linear-gradient(135deg, #ececec 0%, #d4d4d4 50%, #a8a8a8 100%)",
  },
];

export function salonTypeInfo(id) {
  return SALON_TYPES.find((t) => t.id === id) || SALON_TYPES[SALON_TYPES.length - 1];
}
