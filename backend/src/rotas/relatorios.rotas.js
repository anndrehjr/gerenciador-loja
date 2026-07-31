import { Router } from "express";
import { obterRelatorioGeral } from "../controladores/relatorios.controlador.js";
import { exigirAutenticacao, exigirSalao } from "../middleware/autenticacao.js";
import { verificarPermissao } from "../middleware/permissoes.js";
import { manipuladorAssincrono } from "../utilitarios/manipuladorAssincrono.js";

export const rotasRelatorios = Router();

rotasRelatorios.use(exigirAutenticacao, exigirSalao, verificarPermissao("relatorios"));
rotasRelatorios.get("/overview", manipuladorAssincrono(obterRelatorioGeral));
