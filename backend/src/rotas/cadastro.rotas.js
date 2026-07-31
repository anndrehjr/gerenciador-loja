import { Router } from "express";
import { cadastrarSalao } from "../controladores/cadastro.controlador.js";
import { manipuladorAssincrono } from "../utilitarios/manipuladorAssincrono.js";

export const rotasCadastro = Router();

rotasCadastro.post("/", manipuladorAssincrono(cadastrarSalao));
