import { Router } from "express";
import {
  listarClientes,
  obterCliente,
  criarCliente,
  atualizarCliente,
  excluirCliente,
} from "../controladores/clientes.controlador.js";
import { exigirAutenticacao, exigirSalao } from "../middleware/autenticacao.js";
import { verificarPermissao } from "../middleware/permissoes.js";
import { manipuladorAssincrono } from "../utilitarios/manipuladorAssincrono.js";

export const rotasClientes = Router();

rotasClientes.use(exigirAutenticacao, exigirSalao, verificarPermissao("clientes"));
rotasClientes.get("/", manipuladorAssincrono(listarClientes));
rotasClientes.get("/:id", manipuladorAssincrono(obterCliente));
rotasClientes.post("/", manipuladorAssincrono(criarCliente));
rotasClientes.patch("/:id", manipuladorAssincrono(atualizarCliente));
rotasClientes.delete("/:id", manipuladorAssincrono(excluirCliente));
