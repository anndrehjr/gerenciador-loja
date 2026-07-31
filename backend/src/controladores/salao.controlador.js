import { z } from "zod";
import { prisma } from "../biblioteca/prisma.js";
import { ErroHttp } from "../middleware/tratadorErros.js";
import { recursosDoPlano } from "../biblioteca/planos.js";

// Identificadores técnicos do design system — compartilhados com o
// frontend (lib/templates.js), não são texto exibido ao usuário.
const TEMPLATES = ["beauty-luxury", "premium-barber", "minimal-studio", "spa-zen", "vitrine-elegante"];

const esquemaAtualizacao = z.object({
  nome: z.string().min(1).optional(),
  urlLogo: z.string().url().optional().nullable(),
  urlBanner: z.string().url().optional().nullable(),
  corPrimaria: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Use um hex válido, ex.: #8B5CF6")
    .optional()
    .nullable(),
  template: z.enum(TEMPLATES).optional(),
  // Só plano PREMIUM pode gravar isso — ver checagem em atualizarMeuSalao.
  // Objeto livre: cada bloco da landing lê só as chaves que reconhece.
  personalizacao: z.record(z.any()).optional().nullable(),
});

const CAMPOS_SELECIONADOS = {
  id: true,
  nome: true,
  slug: true,
  dominio: true,
  plano: true,
  categoria: true,
  template: true,
  urlLogo: true,
  urlBanner: true,
  corPrimaria: true,
  personalizacao: true,
};

// Diferente das rotas do painel master, aqui o salão nunca vem da URL — é
// sempre o do usuário logado (req.salaoId), então não tem como um admin
// editar a marca de outro salão nem por engano.
export async function obterMeuSalao(req, res) {
  const salao = await prisma.salao.findUnique({
    where: { id: req.salaoId },
    select: CAMPOS_SELECIONADOS,
  });
  res.json(salao);
}

export async function atualizarMeuSalao(req, res) {
  const dados = esquemaAtualizacao.parse(req.body);

  if (dados.personalizacao !== undefined) {
    const salao = await prisma.salao.findUnique({ where: { id: req.salaoId }, select: { plano: true } });
    if (!recursosDoPlano(salao.plano).personalizacaoCompleta) {
      throw new ErroHttp(403, "Personalização completa é exclusiva do plano PREMIUM.");
    }
  }

  const salao = await prisma.salao.update({
    where: { id: req.salaoId },
    data: dados,
    select: CAMPOS_SELECIONADOS,
  });
  res.json(salao);
}
