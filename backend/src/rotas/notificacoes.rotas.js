import { Router } from "express";
import {
  listarNotificacoes,
  contarNaoLidas,
  marcarComoLida,
  marcarTodasComoLidas,
} from "../controladores/notificacoes.controlador.js";
import { exigirAutenticacao, exigirSalao } from "../middleware/autenticacao.js";
import { manipuladorAssincrono } from "../utilitarios/manipuladorAssincrono.js";

export const rotasNotificacoes = Router();

// Sem verificarPermissao de propósito — é um recurso comum aos 4 papéis de
// equipe (igual "painel"/"agenda"), não uma área de gestão restrita.
rotasNotificacoes.use(exigirAutenticacao, exigirSalao);
rotasNotificacoes.get("/", manipuladorAssincrono(listarNotificacoes));
rotasNotificacoes.get("/nao-lidas", manipuladorAssincrono(contarNaoLidas));
rotasNotificacoes.patch("/:id", manipuladorAssincrono(marcarComoLida));
rotasNotificacoes.post("/marcar-todas-lidas", manipuladorAssincrono(marcarTodasComoLidas));
