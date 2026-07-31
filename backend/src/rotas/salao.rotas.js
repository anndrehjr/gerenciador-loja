import { Router } from "express";
import { obterMeuSalao, atualizarMeuSalao } from "../controladores/salao.controlador.js";
import { exigirAutenticacao, exigirSalao } from "../middleware/autenticacao.js";
import { verificarPermissao } from "../middleware/permissoes.js";
import { manipuladorAssincrono } from "../utilitarios/manipuladorAssincrono.js";

export const rotasSalao = Router();

rotasSalao.use(exigirAutenticacao, exigirSalao, verificarPermissao("configuracoes"));
rotasSalao.get("/", manipuladorAssincrono(obterMeuSalao));
rotasSalao.patch("/", manipuladorAssincrono(atualizarMeuSalao));
