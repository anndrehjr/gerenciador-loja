-- Índice composto pra tela de agenda ("agendamentos de hoje do salão X") e
-- pros filtros por status — sem isso o Postgres cruza dois índices de coluna
-- única em toda consulta (auditoria de 2026-07-31, achado "Alto"/"Baixo
-- esforço"). Só CREATE INDEX, sem downtime nem reescrita de tabela.

-- CreateIndex
CREATE INDEX "Agendamento_salaoId_data_idx" ON "Agendamento"("salaoId", "data");

-- CreateIndex
CREATE INDEX "Agendamento_salaoId_status_idx" ON "Agendamento"("salaoId", "status");
