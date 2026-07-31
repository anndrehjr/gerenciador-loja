import { Router } from "express";
import { login, logout, me, esqueciSenha, trocarSenha, trocarMinhaSenha } from "../controladores/autenticacao.controlador.js";
import { exigirAutenticacao } from "../middleware/autenticacao.js";
import { manipuladorAssincrono } from "../utilitarios/manipuladorAssincrono.js";

export const rotasAutenticacao = Router();

rotasAutenticacao.post("/login", manipuladorAssincrono(login));
rotasAutenticacao.post("/logout", manipuladorAssincrono(logout));
rotasAutenticacao.get("/me", exigirAutenticacao, manipuladorAssincrono(me));

// Rate limit próprio (limitadorLogin, montado em aplicacao.js) — pedir
// redefinição de senha é tão sensível a abuso/spam quanto tentar logar.
rotasAutenticacao.post("/esqueci-senha", manipuladorAssincrono(esqueciSenha));
rotasAutenticacao.post("/trocar-senha", manipuladorAssincrono(trocarSenha));
rotasAutenticacao.patch("/minha-senha", exigirAutenticacao, manipuladorAssincrono(trocarMinhaSenha));
