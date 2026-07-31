import { Router } from "express";
import { listar, convidar, atualizar, remover } from "../controladores/equipe.controlador.js";
import { exigirAutenticacao, exigirSalao } from "../middleware/autenticacao.js";
import { verificarPermissao } from "../middleware/permissoes.js";
import { manipuladorAssincrono } from "../utilitarios/manipuladorAssincrono.js";

export const rotasEquipe = Router();

rotasEquipe.use(exigirAutenticacao, exigirSalao, verificarPermissao("equipe"));
rotasEquipe.get("/", manipuladorAssincrono(listar));
rotasEquipe.post("/", manipuladorAssincrono(convidar));
rotasEquipe.patch("/:id", manipuladorAssincrono(atualizar));
rotasEquipe.delete("/:id", manipuladorAssincrono(remover));
