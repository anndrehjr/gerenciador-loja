import { prisma } from "../biblioteca/prisma.js";
import { iniciarAssinaturaTeste } from "./assinatura.servico.js";

// Núcleo compartilhado entre o cadastro público (Fase 6, controladores/publico.controlador.js)
// e a criação manual pelo Painel Mestre (controladores/mestre.controlador.js)
// — os dois terminam criando a mesma tripla Salao + Usuario(DONO via
// MembroEquipe) + Assinatura(TESTE); só a origem do pedido muda.
export async function criarSalaoComDono({
  nome,
  slug,
  dominio,
  plano,
  categoria,
  senhaHash,
  nomeAdmin,
  emailAdmin,
  camposCadastrais = {},
}) {
  return prisma.$transaction(async (tx) => {
    const salao = await tx.salao.create({
      data: {
        nome,
        slug,
        dominio: dominio || null,
        plano: plano || "START",
        ...(categoria ? { categoria } : {}),
        ...camposCadastrais,
      },
    });

    const admin = await tx.usuario.create({
      data: { nome: nomeAdmin, email: emailAdmin, senhaHash, papel: "ADMINISTRADOR", salaoId: salao.id },
    });

    await tx.membroEquipe.create({ data: { usuarioId: admin.id, salaoId: salao.id, papel: "DONO" } });
    await iniciarAssinaturaTeste(tx, salao.id, plano || "START");

    return salao;
  });
}
