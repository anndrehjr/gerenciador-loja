-- Evolução SaaS (Fases 5/9/11/12/15 da auditoria): RBAC granular por salão,
-- financeiro, assinatura da plataforma, auditoria e soft delete.
-- Escrita à mão seguindo o mesmo formato que o `prisma migrate dev` gera
-- (sem conexão de banco disponível neste ambiente pra gerar automaticamente)
-- — NÃO foi aplicada em nenhum banco ainda. Revisar antes de rodar.

-- ==================== RBAC (Fase 5) ====================

CREATE TYPE "PapelEquipe" AS ENUM ('DONO', 'GERENTE', 'PROFISSIONAL', 'RECEPCIONISTA');

CREATE TABLE "MembroEquipe" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "salaoId" TEXT NOT NULL,
    "papel" "PapelEquipe" NOT NULL,
    "profissionalId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MembroEquipe_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MembroEquipe_usuarioId_salaoId_key" ON "MembroEquipe"("usuarioId", "salaoId");
CREATE INDEX "MembroEquipe_salaoId_idx" ON "MembroEquipe"("salaoId");
CREATE INDEX "MembroEquipe_profissionalId_idx" ON "MembroEquipe"("profissionalId");

ALTER TABLE "MembroEquipe" ADD CONSTRAINT "MembroEquipe_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MembroEquipe" ADD CONSTRAINT "MembroEquipe_salaoId_fkey" FOREIGN KEY ("salaoId") REFERENCES "Salao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MembroEquipe" ADD CONSTRAINT "MembroEquipe_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "Profissional"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill: todo ADMINISTRADOR já existente vira DONO do próprio salão —
-- sem isso, verificarPermissao() trancaria contas que já existem hoje.
INSERT INTO "MembroEquipe" ("id", "usuarioId", "salaoId", "papel", "criadoEm", "atualizadoEm")
SELECT gen_random_uuid()::text, "id", "salaoId", 'DONO', now(), now()
FROM "Usuario"
WHERE "papel" = 'ADMINISTRADOR' AND "salaoId" IS NOT NULL;

-- ==================== Soft delete (Fase 12) ====================

ALTER TABLE "Salao" ADD COLUMN "deletadoEm" TIMESTAMP(3);
ALTER TABLE "Cliente" ADD COLUMN "deletadoEm" TIMESTAMP(3);
ALTER TABLE "Servico" ADD COLUMN "deletadoEm" TIMESTAMP(3);
ALTER TABLE "Profissional" ADD COLUMN "deletadoEm" TIMESTAMP(3);
ALTER TABLE "Agendamento" ADD COLUMN "deletadoEm" TIMESTAMP(3);

-- ==================== Cliente: campos novos (Fase 8) ====================

ALTER TABLE "Cliente" ADD COLUMN "dataNascimento" TIMESTAMP(3);
ALTER TABLE "Cliente" ADD COLUMN "vip" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Cliente" ADD COLUMN "observacoes" TEXT;

CREATE INDEX "Cliente_salaoId_vip_idx" ON "Cliente"("salaoId", "vip");

-- ==================== Novo status de agendamento (Fase 7) ====================
-- Postgres não deixa usar um valor de enum na mesma transação em que ele foi
-- criado — como nenhuma outra instrução deste arquivo grava 'EM_ATENDIMENTO',
-- é seguro adicionar aqui mesmo.

ALTER TYPE "StatusAgendamento" ADD VALUE 'EM_ATENDIMENTO' BEFORE 'CONCLUIDO';

-- ==================== Financeiro (Fase 9) ====================

CREATE TYPE "MetodoPagamento" AS ENUM ('DINHEIRO', 'PIX', 'CARTAO');

CREATE TABLE "Pagamento" (
    "id" TEXT NOT NULL,
    "agendamentoId" TEXT NOT NULL,
    "valorCentavos" INTEGER NOT NULL,
    "metodo" "MetodoPagamento" NOT NULL,
    "pagoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "salaoId" TEXT NOT NULL,

    CONSTRAINT "Pagamento_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Pagamento_agendamentoId_key" ON "Pagamento"("agendamentoId");
CREATE INDEX "Pagamento_salaoId_pagoEm_idx" ON "Pagamento"("salaoId", "pagoEm");

ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_agendamentoId_fkey" FOREIGN KEY ("agendamentoId") REFERENCES "Agendamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_salaoId_fkey" FOREIGN KEY ("salaoId") REFERENCES "Salao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Comissao" (
    "id" TEXT NOT NULL,
    "profissionalId" TEXT NOT NULL,
    "pagamentoId" TEXT NOT NULL,
    "percentual" DOUBLE PRECISION NOT NULL,
    "valorCentavos" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "salaoId" TEXT NOT NULL,

    CONSTRAINT "Comissao_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Comissao_pagamentoId_key" ON "Comissao"("pagamentoId");
CREATE INDEX "Comissao_salaoId_idx" ON "Comissao"("salaoId");
CREATE INDEX "Comissao_profissionalId_idx" ON "Comissao"("profissionalId");

ALTER TABLE "Comissao" ADD CONSTRAINT "Comissao_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "Profissional"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Comissao" ADD CONSTRAINT "Comissao_pagamentoId_fkey" FOREIGN KEY ("pagamentoId") REFERENCES "Pagamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Comissao" ADD CONSTRAINT "Comissao_salaoId_fkey" FOREIGN KEY ("salaoId") REFERENCES "Salao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ==================== Assinatura da plataforma (Fase 11) ====================

CREATE TABLE "Plano" (
    "id" TEXT NOT NULL,
    "chave" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "precoCentavos" INTEGER NOT NULL,
    "limites" JSONB,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Plano_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Plano_chave_key" ON "Plano"("chave");

-- Seed dos 3 planos já usados por biblioteca/planos.js — preço em "sob
-- consulta" (0) até existir uma decisão comercial real de tabela de preços.
INSERT INTO "Plano" ("id", "chave", "nome", "precoCentavos", "criadoEm") VALUES
  (gen_random_uuid()::text, 'START', 'Start', 0, now()),
  (gen_random_uuid()::text, 'PRO', 'Pro', 0, now()),
  (gen_random_uuid()::text, 'PREMIUM', 'Premium', 0, now());

CREATE TYPE "StatusAssinatura" AS ENUM ('TESTE', 'ATIVA', 'ATRASADA', 'CANCELADA');

CREATE TABLE "Assinatura" (
    "id" TEXT NOT NULL,
    "salaoId" TEXT NOT NULL,
    "planoId" TEXT NOT NULL,
    "status" "StatusAssinatura" NOT NULL DEFAULT 'TESTE',
    "gatewayProvedor" TEXT,
    "idGatewayExterno" TEXT,
    "inicioTeste" TIMESTAMP(3),
    "fimTeste" TIMESTAMP(3),
    "proximaCobranca" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assinatura_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Assinatura_salaoId_key" ON "Assinatura"("salaoId");
CREATE INDEX "Assinatura_planoId_idx" ON "Assinatura"("planoId");

ALTER TABLE "Assinatura" ADD CONSTRAINT "Assinatura_salaoId_fkey" FOREIGN KEY ("salaoId") REFERENCES "Salao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Assinatura" ADD CONSTRAINT "Assinatura_planoId_fkey" FOREIGN KEY ("planoId") REFERENCES "Plano"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Backfill: todo salão já existente ganha uma Assinatura no plano
-- correspondente ao Salao.plano atual dele, status ATIVA (já são clientes
-- em operação, não estão em teste).
INSERT INTO "Assinatura" ("id", "salaoId", "planoId", "status", "criadoEm", "atualizadoEm")
SELECT gen_random_uuid()::text, s."id", p."id", 'ATIVA', now(), now()
FROM "Salao" s
JOIN "Plano" p ON p."chave" = s."plano";

CREATE TYPE "StatusFatura" AS ENUM ('PENDENTE', 'PAGA', 'ATRASADA', 'CANCELADA');

CREATE TABLE "Fatura" (
    "id" TEXT NOT NULL,
    "assinaturaId" TEXT NOT NULL,
    "valorCentavos" INTEGER NOT NULL,
    "status" "StatusFatura" NOT NULL DEFAULT 'PENDENTE',
    "vencimento" TIMESTAMP(3) NOT NULL,
    "pagaEm" TIMESTAMP(3),
    "idGatewayExterno" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Fatura_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Fatura_assinaturaId_status_idx" ON "Fatura"("assinaturaId", "status");

ALTER TABLE "Fatura" ADD CONSTRAINT "Fatura_assinaturaId_fkey" FOREIGN KEY ("assinaturaId") REFERENCES "Assinatura"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ==================== Segurança (Fase 12) ====================

CREATE TABLE "TokenRedefinicaoSenha" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "usadoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TokenRedefinicaoSenha_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TokenRedefinicaoSenha_token_key" ON "TokenRedefinicaoSenha"("token");
CREATE INDEX "TokenRedefinicaoSenha_usuarioId_idx" ON "TokenRedefinicaoSenha"("usuarioId");

ALTER TABLE "TokenRedefinicaoSenha" ADD CONSTRAINT "TokenRedefinicaoSenha_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "LogAuditoria" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "acao" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidadeId" TEXT,
    "detalhes" JSONB,
    "ip" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "salaoId" TEXT,

    CONSTRAINT "LogAuditoria_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LogAuditoria_salaoId_criadoEm_idx" ON "LogAuditoria"("salaoId", "criadoEm");
CREATE INDEX "LogAuditoria_usuarioId_idx" ON "LogAuditoria"("usuarioId");

ALTER TABLE "LogAuditoria" ADD CONSTRAINT "LogAuditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "LogAuditoria" ADD CONSTRAINT "LogAuditoria_salaoId_fkey" FOREIGN KEY ("salaoId") REFERENCES "Salao"("id") ON DELETE SET NULL ON UPDATE CASCADE;
