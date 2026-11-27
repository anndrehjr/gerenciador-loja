// Testes de integração de rota — precisam de um Postgres real (DATABASE_URL
// apontando pra um banco de teste dedicado, nunca o de produção). Sem
// DATABASE_URL, este arquivo é pulado inteiro (npm test continua funcionando
// sem banco, como sempre funcionou — ver DOCUMENTACAO/Instalacao.md).
//
// Cobre o que a auditoria de 2026-07-31 apontou como a maior lacuna de teste
// do projeto: autenticação, isolamento entre tenants e a checagem de estado
// vivo (revogação de sessão) — não só as funções puras já testadas em
// biblioteca/*.test.js.
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { aplicacao } from "../aplicacao.js";
import { prisma } from "../biblioteca/prisma.js";
import { criarSalaoComDono } from "../servicos/onboarding.servico.js";
import { gerarHashSenha } from "../utilitarios/senha.js";

// process.env.DATABASE_URL sempre existe (o .env de dev local tem um valor),
// então checar só a presença da variável não basta — pode apontar pra um
// Postgres que não está de pé agora. Testa a conexão de verdade antes de
// decidir pular, senão `npm test` sem banco rodando localmente falha em vez
// de simplesmente pular estes testes como sempre funcionou.
const TEM_BANCO = await prisma
  .$connect()
  .then(() => true)
  .catch(() => false);

const SENHA = "Senha@Teste123";
const sufixo = Date.now();

describe(
  "integração: autenticação e isolamento de tenant",
  { skip: !TEM_BANCO && "Postgres inalcançável — requer um banco de teste real de pé (ver DOCUMENTACAO/Instalacao.md)" },
  () => {
    let salaoA, salaoB, clienteA, clienteB;

    before(async () => {
      const senhaHash = await gerarHashSenha(SENHA);
      salaoA = await criarSalaoComDono({
        nome: `Teste Integração A ${sufixo}`,
        slug: `teste-integracao-a-${sufixo}`,
        senhaHash,
        nomeAdmin: "Dono A",
        emailAdmin: `dono-a-${sufixo}@teste.local`,
      });
      salaoB = await criarSalaoComDono({
        nome: `Teste Integração B ${sufixo}`,
        slug: `teste-integracao-b-${sufixo}`,
        senhaHash,
        nomeAdmin: "Dono B",
        emailAdmin: `dono-b-${sufixo}@teste.local`,
      });
      clienteA = await prisma.cliente.create({ data: { nome: "Cliente A", salaoId: salaoA.id } });
      clienteB = await prisma.cliente.create({ data: { nome: "Cliente B", salaoId: salaoB.id } });
    });

    after(async () => {
      const salaoIds = [salaoA.id, salaoB.id];
      await prisma.profissional.deleteMany({ where: { salaoId: { in: salaoIds } } });
      await prisma.cliente.deleteMany({ where: { salaoId: { in: salaoIds } } });
      await prisma.membroEquipe.deleteMany({ where: { salaoId: { in: salaoIds } } });
      await prisma.fatura.deleteMany({ where: { assinatura: { salaoId: { in: salaoIds } } } });
      await prisma.assinatura.deleteMany({ where: { salaoId: { in: salaoIds } } });
      await prisma.plano.deleteMany({ where: { chave: { startsWith: `TESTE_LIMITE_${sufixo}` } } });
      await prisma.usuario.deleteMany({ where: { salaoId: { in: salaoIds } } });
      await prisma.salao.deleteMany({ where: { id: { in: salaoIds } } });
      await prisma.$disconnect();
    });

    it("rota protegida sem cookie retorna 401", async () => {
      const resp = await request(aplicacao).get("/api/clients");
      assert.equal(resp.status, 401);
    });

    it("login com senha errada retorna 401", async () => {
      const resp = await request(aplicacao)
        .post("/api/auth/login")
        .send({ email: `dono-a-${sufixo}@teste.local`, senha: "senha-errada" });
      assert.equal(resp.status, 401);
    });

    it("login correto retorna 200 e seta o cookie de sessão", async () => {
      const resp = await request(aplicacao)
        .post("/api/auth/login")
        .send({ email: `dono-a-${sufixo}@teste.local`, senha: SENHA });
      assert.equal(resp.status, 200);
      assert.ok(resp.headers["set-cookie"]?.some((c) => c.startsWith("salao_session=")));
    });

    it("um salão não enxerga cliente de outro salão pelo id — 404, não vazamento de dado", async () => {
      const agenteA = request.agent(aplicacao);
      await agenteA.post("/api/auth/login").send({ email: `dono-a-${sufixo}@teste.local`, senha: SENHA });

      const proprio = await agenteA.get(`/api/clients/${clienteA.id}`);
      assert.equal(proprio.status, 200);

      const alheio = await agenteA.get(`/api/clients/${clienteB.id}`);
      assert.equal(alheio.status, 404);
    });

    it("suspender o salão bloqueia o mesmo cookie na próxima requisição, sem precisar logar de novo", async () => {
      const agenteA = request.agent(aplicacao);
      await agenteA.post("/api/auth/login").send({ email: `dono-a-${sufixo}@teste.local`, senha: SENHA });

      assert.equal((await agenteA.get("/api/clients")).status, 200);

      await prisma.salao.update({ where: { id: salaoA.id }, data: { status: "SUSPENSO" } });
      assert.equal((await agenteA.get("/api/clients")).status, 403);

      await prisma.salao.update({ where: { id: salaoA.id }, data: { status: "ATIVO" } });
      assert.equal((await agenteA.get("/api/clients")).status, 200);
    });

    it("remover o usuário bloqueia o mesmo cookie na próxima requisição", async () => {
      const senhaHash = await gerarHashSenha(SENHA);
      const descartavel = await prisma.usuario.create({
        data: {
          nome: "Descartável",
          email: `descartavel-${sufixo}@teste.local`,
          senhaHash,
          papel: "ADMINISTRADOR",
          salaoId: salaoA.id,
        },
      });
      await prisma.membroEquipe.create({
        data: { usuarioId: descartavel.id, salaoId: salaoA.id, papel: "RECEPCIONISTA" },
      });

      const agente = request.agent(aplicacao);
      await agente.post("/api/auth/login").send({ email: `descartavel-${sufixo}@teste.local`, senha: SENHA });
      assert.equal((await agente.get("/api/clients")).status, 200);

      await prisma.usuario.delete({ where: { id: descartavel.id } });
      assert.equal((await agente.get("/api/clients")).status, 401);
    });

    it("limite de profissionais do plano é aplicado (402 ao estourar)", async () => {
      const planoLimitado = await prisma.plano.create({
        data: {
          chave: `TESTE_LIMITE_${sufixo}`,
          nome: "Teste Limite",
          precoCentavos: 0,
          limites: { maxProfissionais: 1 },
        },
      });
      await prisma.assinatura.update({
        where: { salaoId: salaoA.id },
        data: { planoId: planoLimitado.id, status: "ATIVA" },
      });

      const agente = request.agent(aplicacao);
      await agente.post("/api/auth/login").send({ email: `dono-a-${sufixo}@teste.local`, senha: SENHA });

      const primeiro = await agente.post("/api/professionals").send({ nome: "Profissional 1" });
      assert.equal(primeiro.status, 201);

      const segundo = await agente.post("/api/professionals").send({ nome: "Profissional 2" });
      assert.equal(segundo.status, 402);
    });
  }
);
