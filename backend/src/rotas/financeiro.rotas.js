import { Router } from "express";
import {
  listarPagamentos,
  registrarPagamento,
  listarDespesas,
  registrarDespesa,
  obterResumoFinanceiro,
} from "../controladores/financeiro.controlador.js";
import { exigirAutenticacao, exigirSalao } from "../middleware/autenticacao.js";
import { verificarPermissao } from "../middleware/permissoes.js";
import { manipuladorAssincrono } from "../utilitarios/manipuladorAssincrono.js";

export const rotasFinanceiro = Router();

rotasFinanceiro.use(exigirAutenticacao, exigirSalao, verificarPermissao("financeiro"));
rotasFinanceiro.get("/summary", manipuladorAssincrono(obterResumoFinanceiro));
rotasFinanceiro.get("/payments", manipuladorAssincrono(listarPagamentos));
rotasFinanceiro.post("/payments", manipuladorAssincrono(registrarPagamento));
rotasFinanceiro.get("/expenses", manipuladorAssincrono(listarDespesas));
rotasFinanceiro.post("/expenses", manipuladorAssincrono(registrarDespesa));
