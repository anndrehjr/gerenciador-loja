import { prisma } from "../biblioteca/prisma.js";
import { ambiente } from "../configuracao/ambiente.js";
import { ErroHttp } from "./tratadorErros.js";

// Resolve o salão pelo domínio próprio configurado (Salao.dominio) — hoje não
// está montado em nenhuma rota (o site público usa /:salaoId), fica pronto
// pra quando domínios próprios por salão entrarem em uso.
export async function resolverSalao(req, res, next) {
  let salao = await prisma.salao.findFirst({
    where: { dominio: req.hostname, status: "ATIVO" },
  });

  if (!salao && ambiente.NODE_ENV !== "production") {
    salao = await prisma.salao.findFirst({
      where: { status: "ATIVO" },
      orderBy: { criadoEm: "asc" },
    });
  }

  if (!salao) {
    throw new ErroHttp(404, "Salão não encontrado.");
  }

  req.salao = salao;
  req.salaoId = salao.id;
  next();
}

// Para as rotas montadas em /api/public/:salaoId — usado pelo site público
// de cada salão (acesso por /:salaoId no frontend). Não depende do Host da
// requisição, então funciona pra qualquer salão a partir do mesmo domínio
// da plataforma. Aceita tanto o slug (URL bonita, ex.: /salao-andre — o que
// o painel mestre mostra pro dono do salão compartilhar) quanto o id cru
// (compatibilidade com links já gerados antes do slug existir).
export async function resolverSalaoPorParametro(req, res, next) {
  const salao = await prisma.salao.findFirst({
    where: {
      status: "ATIVO",
      OR: [{ slug: req.params.salaoId }, { id: req.params.salaoId }],
    },
  });

  if (!salao) {
    throw new ErroHttp(404, "Salão não encontrado.");
  }

  req.salao = salao;
  req.salaoId = salao.id;
  next();
}
