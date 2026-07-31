import { Router } from "express";
import {
  listarProfissionais,
  obterProfissional,
  criarProfissional,
  atualizarProfissional,
  excluirProfissional,
  substituirHorariosTrabalho,
  criarAusencia,
  excluirAusencia,
} from "../controladores/profissionais.controlador.js";
import { exigirAutenticacao, exigirSalao } from "../middleware/autenticacao.js";
import { verificarPermissao } from "../middleware/permissoes.js";
import { manipuladorAssincrono } from "../utilitarios/manipuladorAssincrono.js";

export const rotasProfissionais = Router();

rotasProfissionais.use(exigirAutenticacao, exigirSalao);
// Mesma lógica de servicos.rotas.js: leitura aberta (Agenda depende disso
// pra listar quem pode atender), gestão (criar/editar/excluir/horários)
// exclusiva de quem tem o recurso "equipe".
rotasProfissionais.get("/", manipuladorAssincrono(listarProfissionais));
rotasProfissionais.get("/:id", manipuladorAssincrono(obterProfissional));
rotasProfissionais.post("/", verificarPermissao("equipe"), manipuladorAssincrono(criarProfissional));
rotasProfissionais.patch("/:id", verificarPermissao("equipe"), manipuladorAssincrono(atualizarProfissional));
rotasProfissionais.delete("/:id", verificarPermissao("equipe"), manipuladorAssincrono(excluirProfissional));
rotasProfissionais.put(
  "/:id/working-hours",
  verificarPermissao("equipe"),
  manipuladorAssincrono(substituirHorariosTrabalho)
);
rotasProfissionais.post("/:id/time-off", verificarPermissao("equipe"), manipuladorAssincrono(criarAusencia));
rotasProfissionais.delete(
  "/:id/time-off/:ausenciaId",
  verificarPermissao("equipe"),
  manipuladorAssincrono(excluirAusencia)
);
