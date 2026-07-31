import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  listarServicosPublicos,
  listarProfissionaisPublicos,
  buscarClientePorTelefone,
  criarClientePublico,
  obterDisponibilidadePublica,
  criarAgendamentoPublico,
  obterInfoSalaoPublico,
} from "../controladores/publico.controlador.js";
import { manipuladorAssincrono } from "../utilitarios/manipuladorAssincrono.js";

const limitadorAgendamento = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas tentativas. Tente novamente em alguns minutos." },
});

// Disponibilidade é a rota pública mais cara (busca profissional + horários +
// férias/agendamentos e gera os slots) — mais generosa que o limitadorAgendamento
// porque o wizard consulta ela a cada troca de serviço/profissional, mas
// ainda assim limitada em vez de cair só no limite global genérico.
const limitadorDisponibilidade = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas tentativas. Tente novamente em alguns minutos." },
});

// As rotas em si não sabem (nem precisam saber) se o salão foi resolvido
// pelo domínio da requisição ou por um :salaoId na URL — isso é resolvido
// antes, por um middleware diferente montado em aplicacao.js pra cada um dos
// dois prefixos (/api/public e /api/public/s/:salaoId). Aqui só existe uma vez.
export const rotasPublicas = Router();

rotasPublicas.get("/salon", manipuladorAssincrono(obterInfoSalaoPublico));
rotasPublicas.get("/services", manipuladorAssincrono(listarServicosPublicos));
rotasPublicas.get("/professionals", manipuladorAssincrono(listarProfissionaisPublicos));
rotasPublicas.get(
  "/professionals/:id/availability",
  limitadorDisponibilidade,
  manipuladorAssincrono(obterDisponibilidadePublica)
);
rotasPublicas.get("/clients/lookup", limitadorAgendamento, manipuladorAssincrono(buscarClientePorTelefone));
rotasPublicas.post("/clients", limitadorAgendamento, manipuladorAssincrono(criarClientePublico));
rotasPublicas.post("/appointments", limitadorAgendamento, manipuladorAssincrono(criarAgendamentoPublico));
