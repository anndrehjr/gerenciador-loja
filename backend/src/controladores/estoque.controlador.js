import { z } from "zod";
import { prisma } from "../biblioteca/prisma.js";
import { ErroHttp } from "../middleware/tratadorErros.js";

const esquemaCategoria = z.object({ nome: z.string().min(1) });

const esquemaProduto = z.object({
  nome: z.string().min(1),
  precoCentavos: z.number().int().nonnegative(),
  estoqueMinimo: z.number().int().nonnegative().optional(),
  validade: z.coerce.date().optional().nullable(),
  categoriaId: z.string().min(1).optional().nullable(),
  ativo: z.boolean().optional(),
});

const esquemaMovimentacao = z.object({
  tipo: z.enum(["ENTRADA", "SAIDA"]),
  quantidade: z.number().int().positive(),
  motivo: z.string().optional().nullable(),
});

export async function listarCategorias(req, res) {
  const categorias = await prisma.categoriaProduto.findMany({
    where: { salaoId: req.salaoId },
    orderBy: { nome: "asc" },
  });
  res.json(categorias);
}

export async function criarCategoria(req, res) {
  const dados = esquemaCategoria.parse(req.body);
  const categoria = await prisma.categoriaProduto.create({ data: { ...dados, salaoId: req.salaoId } }).catch((err) => {
    if (err.code === "P2002") throw new ErroHttp(409, "Já existe uma categoria com esse nome.");
    throw err;
  });
  res.status(201).json(categoria);
}

// Comparar duas colunas (estoqueAtual < estoqueMinimo) não dá pra fazer num
// `where` simples do Prisma sem SQL cru — como a lista de produtos de um
// salão é sempre pequena (dezenas, não milhares), filtra em memória mesmo.
export async function listarProdutos(req, res) {
  const somenteBaixoEstoque = req.query.baixoEstoque === "true";
  const produtos = await prisma.produto.findMany({
    where: { salaoId: req.salaoId, deletadoEm: null },
    include: { categoria: true },
    orderBy: { nome: "asc" },
  });
  res.json(somenteBaixoEstoque ? produtos.filter((p) => p.estoqueAtual < p.estoqueMinimo) : produtos);
}

export async function obterProduto(req, res) {
  const produto = await prisma.produto.findFirst({
    where: { id: req.params.id, salaoId: req.salaoId, deletadoEm: null },
    include: { categoria: true, movimentacoes: { orderBy: { criadoEm: "desc" }, take: 20 } },
  });
  if (!produto) throw new ErroHttp(404, "Produto não encontrado.");
  res.json(produto);
}

export async function criarProduto(req, res) {
  const dados = esquemaProduto.parse(req.body);
  const produto = await prisma.produto.create({ data: { ...dados, salaoId: req.salaoId } }).catch((err) => {
    if (err.code === "P2002") throw new ErroHttp(409, "Já existe um produto com esse nome.");
    throw err;
  });
  res.status(201).json(produto);
}

export async function atualizarProduto(req, res) {
  const dados = esquemaProduto.partial().parse(req.body);
  const existente = await prisma.produto.findFirst({ where: { id: req.params.id, salaoId: req.salaoId, deletadoEm: null } });
  if (!existente) throw new ErroHttp(404, "Produto não encontrado.");
  const produto = await prisma.produto.update({ where: { id: existente.id }, data: dados });
  res.json(produto);
}

export async function excluirProduto(req, res) {
  const existente = await prisma.produto.findFirst({ where: { id: req.params.id, salaoId: req.salaoId, deletadoEm: null } });
  if (!existente) throw new ErroHttp(404, "Produto não encontrado.");
  await prisma.produto.update({ where: { id: existente.id }, data: { deletadoEm: new Date() } });
  res.status(204).send();
}

// Grava a movimentação e ajusta o saldo do produto na mesma transação —
// nunca deixa o histórico e o saldo atual dessincronizarem.
export async function registrarMovimentacao(req, res) {
  const dados = esquemaMovimentacao.parse(req.body);
  const produto = await prisma.produto.findFirst({ where: { id: req.params.id, salaoId: req.salaoId, deletadoEm: null } });
  if (!produto) throw new ErroHttp(404, "Produto não encontrado.");

  if (dados.tipo === "SAIDA" && produto.estoqueAtual < dados.quantidade) {
    throw new ErroHttp(400, "Quantidade maior que o estoque disponível.");
  }
  const delta = dados.tipo === "ENTRADA" ? dados.quantidade : -dados.quantidade;

  const [, produtoAtualizado] = await prisma.$transaction([
    prisma.movimentacaoEstoque.create({ data: { ...dados, produtoId: produto.id, salaoId: req.salaoId } }),
    prisma.produto.update({ where: { id: produto.id }, data: { estoqueAtual: { increment: delta } } }),
  ]);
  res.status(201).json(produtoAtualizado);
}
