import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { ambiente } from "./configuracao/ambiente.js";
import { rotasAutenticacao } from "./rotas/autenticacao.rotas.js";
import { rotasClientes } from "./rotas/clientes.rotas.js";
import { rotasServicos } from "./rotas/servicos.rotas.js";
import { rotasAgendamentos } from "./rotas/agendamentos.rotas.js";
import { rotasProfissionais } from "./rotas/profissionais.rotas.js";
import { rotasPublicas } from "./rotas/publico.rotas.js";
import { rotasMestre } from "./rotas/mestre.rotas.js";
import { rotasSalao } from "./rotas/salao.rotas.js";
import { rotasEquipe } from "./rotas/equipe.rotas.js";
import { rotasFinanceiro } from "./rotas/financeiro.rotas.js";
import { rotasRelatorios } from "./rotas/relatorios.rotas.js";
import { rotasCadastro } from "./rotas/cadastro.rotas.js";
import { rotasEstoque } from "./rotas/estoque.rotas.js";
import { rotasNotificacoes } from "./rotas/notificacoes.rotas.js";
import { tratadorRotaNaoEncontrada, tratadorErros } from "./middleware/tratadorErros.js";
import { resolverSalaoPorParametro } from "./middleware/salao.js";
import { manipuladorAssincrono } from "./utilitarios/manipuladorAssincrono.js";

export const aplicacao = express();

// Cadeia real até a API: Cloudflare (proxy) -> nginx-proxy-manager -> nginx
// do container "app" -> aqui. Confiar em "true" aceitaria qualquer valor que
// o próprio visitante mandasse em X-Forwarded-For, permitindo forjar o IP e
// contornar o rate limit (login e agendamento público). Com um número fixo
// de saltos, o Express ignora qualquer coisa além dos 3 proxies conhecidos.
aplicacao.set("trust proxy", 3);

aplicacao.use(helmet());
aplicacao.use(
  cors({
    origin: ambiente.CORS_ORIGIN,
    credentials: true,
  })
);
aplicacao.use(express.json());
aplicacao.use(cookieParser());
if (ambiente.NODE_ENV !== "test") {
  aplicacao.use(morgan("dev"));
}

aplicacao.get("/api/health", (req, res) => res.json({ status: "ok" }));

const limitadorApi = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

const limitadorLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas tentativas de login. Tente novamente em alguns minutos." },
  skipSuccessfulRequests: true,
});

aplicacao.use("/api", limitadorApi);
aplicacao.use("/api/auth/login", limitadorLogin);
aplicacao.use("/api/auth/esqueci-senha", limitadorLogin);
aplicacao.use("/api/auth", rotasAutenticacao);
aplicacao.use("/api/signup", limitadorLogin, rotasCadastro);

// Site público do salão em /:salaoId — resolve o salão pelo id ou slug na
// URL, sem precisar de DNS/domínio próprio configurado (resolverSalao por
// domínio segue disponível em middleware/salao.js pra quando domínios
// próprios entrarem em uso).
aplicacao.use("/api/public/:salaoId", manipuladorAssincrono(resolverSalaoPorParametro), rotasPublicas);

aplicacao.use("/api/clients", rotasClientes);
aplicacao.use("/api/services", rotasServicos);
aplicacao.use("/api/appointments", rotasAgendamentos);
aplicacao.use("/api/professionals", rotasProfissionais);
aplicacao.use("/api/salon", rotasSalao);
aplicacao.use("/api/team", rotasEquipe);
aplicacao.use("/api/finance", rotasFinanceiro);
aplicacao.use("/api/reports", rotasRelatorios);
aplicacao.use("/api/inventory", rotasEstoque);
aplicacao.use("/api/notifications", rotasNotificacoes);
aplicacao.use("/api/master", rotasMestre);

aplicacao.use(tratadorRotaNaoEncontrada);
aplicacao.use(tratadorErros);
