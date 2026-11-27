-- Constraints CHECK pros invariantes mais consequentes do schema (achado da
-- auditoria de 2026-07-31: "nada no banco impede estoqueAtual < 0,
-- minutoFim <= minutoInicio, dataFim <= dataInicio, ou dinheiro negativo —
-- tudo depende só de validação na aplicação"). Escrita à mão, seguindo o
-- mesmo formato das migrations 20260730120000/20260731090000 (Prisma 5.x
-- não declara CHECK no schema.prisma) — validada em staging antes de
-- aplicar em produção, como as anteriores.

-- ==================== Estoque ====================
ALTER TABLE "Produto" ADD CONSTRAINT "Produto_estoqueAtual_nao_negativo" CHECK ("estoqueAtual" >= 0);
ALTER TABLE "Produto" ADD CONSTRAINT "Produto_estoqueMinimo_nao_negativo" CHECK ("estoqueMinimo" >= 0);
ALTER TABLE "Produto" ADD CONSTRAINT "Produto_precoCentavos_nao_negativo" CHECK ("precoCentavos" >= 0);
ALTER TABLE "MovimentacaoEstoque" ADD CONSTRAINT "MovimentacaoEstoque_quantidade_positiva" CHECK ("quantidade" > 0);

-- ==================== Horários e ausências ====================
ALTER TABLE "HorarioTrabalho" ADD CONSTRAINT "HorarioTrabalho_fim_apos_inicio" CHECK ("minutoFim" > "minutoInicio");
ALTER TABLE "HorarioTrabalho" ADD CONSTRAINT "HorarioTrabalho_minutoInicio_valido" CHECK ("minutoInicio" >= 0 AND "minutoInicio" < 1440);
ALTER TABLE "HorarioTrabalho" ADD CONSTRAINT "HorarioTrabalho_minutoFim_valido" CHECK ("minutoFim" > 0 AND "minutoFim" <= 1440);
ALTER TABLE "Ausencia" ADD CONSTRAINT "Ausencia_fim_apos_inicio" CHECK ("dataFim" > "dataInicio");

-- ==================== Financeiro ====================
ALTER TABLE "Servico" ADD CONSTRAINT "Servico_precoCentavos_nao_negativo" CHECK ("precoCentavos" >= 0);
ALTER TABLE "Servico" ADD CONSTRAINT "Servico_duracaoMinutos_positiva" CHECK ("duracaoMinutos" > 0);
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_valorCentavos_nao_negativo" CHECK ("valorCentavos" >= 0);
ALTER TABLE "Comissao" ADD CONSTRAINT "Comissao_valorCentavos_nao_negativo" CHECK ("valorCentavos" >= 0);
ALTER TABLE "Comissao" ADD CONSTRAINT "Comissao_percentual_valido" CHECK ("percentual" >= 0 AND "percentual" <= 100);
ALTER TABLE "Despesa" ADD CONSTRAINT "Despesa_valorCentavos_nao_negativo" CHECK ("valorCentavos" >= 0);
ALTER TABLE "Plano" ADD CONSTRAINT "Plano_precoCentavos_nao_negativo" CHECK ("precoCentavos" >= 0);
ALTER TABLE "Fatura" ADD CONSTRAINT "Fatura_valorCentavos_nao_negativo" CHECK ("valorCentavos" >= 0);
