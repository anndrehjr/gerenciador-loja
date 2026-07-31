import { Router } from "express";
import {
  listarAgendamentos,
  obterAgendamento,
  criarAgendamento,
  atualizarAgendamento,
  excluirAgendamento,
} from "../controladores/agendamentos.controlador.js";
import { exigirAutenticacao, exigirSalao } from "../middleware/autenticacao.js";
import { verificarPermissao } from "../middleware/permissoes.js";
import { manipuladorAssincrono } from "../utilitarios/manipuladorAssincrono.js";

export const rotasAgendamentos = Router();

rotasAgendamentos.use(exigirAutenticacao, exigirSalao, verificarPermissao("agenda"));
rotasAgendamentos.get("/", manipuladorAssincrono(listarAgendamentos));
rotasAgendamentos.get("/:id", manipuladorAssincrono(obterAgendamento));
rotasAgendamentos.post("/", manipuladorAssincrono(criarAgendamento));
rotasAgendamentos.patch("/:id", manipuladorAssincrono(atualizarAgendamento));
rotasAgendamentos.delete("/:id", manipuladorAssincrono(excluirAgendamento));
