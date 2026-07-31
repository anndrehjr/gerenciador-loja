import { Router } from "express";
import {
  listarCategorias,
  criarCategoria,
  listarProdutos,
  obterProduto,
  criarProduto,
  atualizarProduto,
  excluirProduto,
  registrarMovimentacao,
} from "../controladores/estoque.controlador.js";
import { exigirAutenticacao, exigirSalao } from "../middleware/autenticacao.js";
import { verificarPermissao } from "../middleware/permissoes.js";
import { manipuladorAssincrono } from "../utilitarios/manipuladorAssincrono.js";

export const rotasEstoque = Router();

rotasEstoque.use(exigirAutenticacao, exigirSalao, verificarPermissao("estoque"));
rotasEstoque.get("/categorias", manipuladorAssincrono(listarCategorias));
rotasEstoque.post("/categorias", manipuladorAssincrono(criarCategoria));
rotasEstoque.get("/produtos", manipuladorAssincrono(listarProdutos));
rotasEstoque.get("/produtos/:id", manipuladorAssincrono(obterProduto));
rotasEstoque.post("/produtos", manipuladorAssincrono(criarProduto));
rotasEstoque.patch("/produtos/:id", manipuladorAssincrono(atualizarProduto));
rotasEstoque.delete("/produtos/:id", manipuladorAssincrono(excluirProduto));
rotasEstoque.post("/produtos/:id/movimentacoes", manipuladorAssincrono(registrarMovimentacao));
