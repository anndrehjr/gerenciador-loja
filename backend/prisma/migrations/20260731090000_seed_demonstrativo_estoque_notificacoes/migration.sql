-- Suporte ao seed demonstrativo: notificações, despesas, estoque, lista de
-- espera, reagendamento e falta. Escrita à mão seguindo o mesmo formato que
-- `prisma migrate dev` gera (sem conexão de banco disponível neste ambiente)
-- — NÃO foi aplicada em nenhum banco ainda. Revisar antes de rodar.

-- ==================== Cliente: foto + profissional favorito ====================

ALTER TABLE "Cliente" ADD COLUMN "urlFoto" TEXT;
ALTER TABLE "Cliente" ADD COLUMN "profissionalFavoritoId" TEXT;
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_profissionalFavoritoId_fkey" FOREIGN KEY ("profissionalFavoritoId") REFERENCES "Profissional"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ==================== Agendamento: falta + reagendamento ====================

ALTER TYPE "StatusAgendamento" ADD VALUE 'NAO_COMPARECEU';

ALTER TABLE "Agendamento" ADD COLUMN "reagendadoDeId" TEXT;
CREATE INDEX "Agendamento_reagendadoDeId_idx" ON "Agendamento"("reagendadoDeId");
ALTER TABLE "Agendamento" ADD CONSTRAINT "Agendamento_reagendadoDeId_fkey" FOREIGN KEY ("reagendadoDeId") REFERENCES "Agendamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ==================== Auditoria: navegador ====================

ALTER TABLE "LogAuditoria" ADD COLUMN "userAgent" TEXT;

-- ==================== Notificações ====================

CREATE TYPE "TipoNotificacao" AS ENUM ('ANIVERSARIANTE', 'PAGAMENTO_RECEBIDO', 'AGENDAMENTO_CANCELADO', 'ESTOQUE_BAIXO', 'COMISSAO_LIBERADA', 'ASSINATURA_VENCENDO');

CREATE TABLE "Notificacao" (
    "id" TEXT NOT NULL,
    "tipo" "TipoNotificacao" NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "salaoId" TEXT NOT NULL,

    CONSTRAINT "Notificacao_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Notificacao_salaoId_lida_criadoEm_idx" ON "Notificacao"("salaoId", "lida", "criadoEm");

ALTER TABLE "Notificacao" ADD CONSTRAINT "Notificacao_salaoId_fkey" FOREIGN KEY ("salaoId") REFERENCES "Salao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ==================== Despesas ====================

CREATE TYPE "CategoriaDespesa" AS ENUM ('ALUGUEL', 'FOLHA_PAGAMENTO', 'PRODUTOS', 'MARKETING', 'MANUTENCAO', 'OUTROS');

CREATE TABLE "Despesa" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "categoria" "CategoriaDespesa" NOT NULL,
    "valorCentavos" INTEGER NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "salaoId" TEXT NOT NULL,

    CONSTRAINT "Despesa_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Despesa_salaoId_data_idx" ON "Despesa"("salaoId", "data");

ALTER TABLE "Despesa" ADD CONSTRAINT "Despesa_salaoId_fkey" FOREIGN KEY ("salaoId") REFERENCES "Salao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ==================== Estoque ====================

CREATE TABLE "CategoriaProduto" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "salaoId" TEXT NOT NULL,

    CONSTRAINT "CategoriaProduto_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CategoriaProduto_salaoId_nome_key" ON "CategoriaProduto"("salaoId", "nome");

ALTER TABLE "CategoriaProduto" ADD CONSTRAINT "CategoriaProduto_salaoId_fkey" FOREIGN KEY ("salaoId") REFERENCES "Salao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Produto" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "precoCentavos" INTEGER NOT NULL,
    "estoqueAtual" INTEGER NOT NULL DEFAULT 0,
    "estoqueMinimo" INTEGER NOT NULL DEFAULT 0,
    "validade" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "deletadoEm" TIMESTAMP(3),
    "categoriaId" TEXT,
    "salaoId" TEXT NOT NULL,

    CONSTRAINT "Produto_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Produto_salaoId_nome_key" ON "Produto"("salaoId", "nome");
CREATE INDEX "Produto_salaoId_estoqueAtual_idx" ON "Produto"("salaoId", "estoqueAtual");

ALTER TABLE "Produto" ADD CONSTRAINT "Produto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaProduto"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Produto" ADD CONSTRAINT "Produto_salaoId_fkey" FOREIGN KEY ("salaoId") REFERENCES "Salao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TYPE "TipoMovimentacaoEstoque" AS ENUM ('ENTRADA', 'SAIDA');

CREATE TABLE "MovimentacaoEstoque" (
    "id" TEXT NOT NULL,
    "tipo" "TipoMovimentacaoEstoque" NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "motivo" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "produtoId" TEXT NOT NULL,
    "salaoId" TEXT NOT NULL,

    CONSTRAINT "MovimentacaoEstoque_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MovimentacaoEstoque_salaoId_criadoEm_idx" ON "MovimentacaoEstoque"("salaoId", "criadoEm");
CREATE INDEX "MovimentacaoEstoque_produtoId_idx" ON "MovimentacaoEstoque"("produtoId");

ALTER TABLE "MovimentacaoEstoque" ADD CONSTRAINT "MovimentacaoEstoque_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MovimentacaoEstoque" ADD CONSTRAINT "MovimentacaoEstoque_salaoId_fkey" FOREIGN KEY ("salaoId") REFERENCES "Salao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ==================== Lista de espera ====================

CREATE TABLE "ListaEspera" (
    "id" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atendida" BOOLEAN NOT NULL DEFAULT false,
    "clienteId" TEXT NOT NULL,
    "servicoId" TEXT NOT NULL,
    "profissionalId" TEXT,
    "salaoId" TEXT NOT NULL,

    CONSTRAINT "ListaEspera_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ListaEspera_salaoId_atendida_idx" ON "ListaEspera"("salaoId", "atendida");

ALTER TABLE "ListaEspera" ADD CONSTRAINT "ListaEspera_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ListaEspera" ADD CONSTRAINT "ListaEspera_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "Servico"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ListaEspera" ADD CONSTRAINT "ListaEspera_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "Profissional"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ListaEspera" ADD CONSTRAINT "ListaEspera_salaoId_fkey" FOREIGN KEY ("salaoId") REFERENCES "Salao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
