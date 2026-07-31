import { Router } from "express";
import {
  listarServicos,
  obterServico,
  criarServico,
  atualizarServico,
  excluirServico,
} from "../controladores/servicos.controlador.js";
import { exigirAutenticacao, exigirSalao } from "../middleware/autenticacao.js";
import { verificarPermissao } from "../middleware/permissoes.js";
import { manipuladorAssincrono } from "../utilitarios/manipuladorAssincrono.js";

export const rotasServicos = Router();

rotasServicos.use(exigirAutenticacao, exigirSalao);
// Leitura fica aberta a qualquer papel com acesso à Agenda — precisam do
// catálogo pra criar/editar um agendamento. Só gerenciar o catálogo em si
// (criar/editar/excluir) é exclusivo de quem tem o recurso "servicos"
// (hoje só DONO, ver biblioteca/permissoes.js).
rotasServicos.get("/", manipuladorAssincrono(listarServicos));
rotasServicos.get("/:id", manipuladorAssincrono(obterServico));
rotasServicos.post("/", verificarPermissao("servicos"), manipuladorAssincrono(criarServico));
rotasServicos.patch("/:id", verificarPermissao("servicos"), manipuladorAssincrono(atualizarServico));
rotasServicos.delete("/:id", verificarPermissao("servicos"), manipuladorAssincrono(excluirServico));
