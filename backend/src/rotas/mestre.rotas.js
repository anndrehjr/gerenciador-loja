import { Router } from "express";
import {
  listarSaloes,
  obterSalao,
  criarSalao,
  atualizarSalao,
  definirStatusSalao,
  definirSenhaUsuario,
  excluirSalao,
} from "../controladores/mestre.controlador.js";
import { listarPlanos, atualizarPlano } from "../controladores/planos.controlador.js";
import { exigirAutenticacao, exigirMestre } from "../middleware/autenticacao.js";
import { manipuladorAssincrono } from "../utilitarios/manipuladorAssincrono.js";

export const rotasMestre = Router();

rotasMestre.use(exigirAutenticacao, exigirMestre);

rotasMestre.get("/salons", manipuladorAssincrono(listarSaloes));
rotasMestre.get("/salons/:id", manipuladorAssincrono(obterSalao));
rotasMestre.post("/salons", manipuladorAssincrono(criarSalao));
rotasMestre.patch("/salons/:id", manipuladorAssincrono(atualizarSalao));
rotasMestre.patch("/salons/:id/status", manipuladorAssincrono(definirStatusSalao));
rotasMestre.patch("/salons/:id/users/:userId/password", manipuladorAssincrono(definirSenhaUsuario));
rotasMestre.delete("/salons/:id", manipuladorAssincrono(excluirSalao));

rotasMestre.get("/plans", manipuladorAssincrono(listarPlanos));
rotasMestre.patch("/plans/:id", manipuladorAssincrono(atualizarPlano));
