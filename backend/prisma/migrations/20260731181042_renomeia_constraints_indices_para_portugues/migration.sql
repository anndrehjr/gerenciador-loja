-- A migration de 2026-07-16 (traduz_schema_para_portugues) renomeou tabelas,
-- colunas e enums, mas não os nomes de constraint/índice que o Postgres
-- gera automaticamente — ficaram presos ao nome original em inglês (ex.:
-- "Appointment_pkey" numa tabela "Agendamento"). Achado colateral da
-- auditoria de 2026-07-31 ao gerar a migration do índice composto: só
-- RENAME, mesma linha, mesmo dado, sem reescrita de tabela nem downtime.

-- AlterTable
ALTER TABLE "Agendamento" RENAME CONSTRAINT "Appointment_pkey" TO "Agendamento_pkey";

-- AlterTable
ALTER TABLE "Ausencia" RENAME CONSTRAINT "TimeOff_pkey" TO "Ausencia_pkey";

-- AlterTable
ALTER TABLE "Cliente" RENAME CONSTRAINT "Client_pkey" TO "Cliente_pkey";

-- AlterTable
ALTER TABLE "HorarioTrabalho" RENAME CONSTRAINT "WorkingHour_pkey" TO "HorarioTrabalho_pkey";

-- AlterTable
ALTER TABLE "Profissional" RENAME CONSTRAINT "Professional_pkey" TO "Profissional_pkey";

-- AlterTable
ALTER TABLE "Salao" RENAME CONSTRAINT "Salon_pkey" TO "Salao_pkey";

-- AlterTable
ALTER TABLE "Servico" RENAME CONSTRAINT "Service_pkey" TO "Servico_pkey";

-- AlterTable
ALTER TABLE "ServicoProfissional" RENAME CONSTRAINT "ServiceProfessional_pkey" TO "ServicoProfissional_pkey";

-- AlterTable
ALTER TABLE "Usuario" RENAME CONSTRAINT "User_pkey" TO "Usuario_pkey";

-- RenameForeignKey
ALTER TABLE "Agendamento" RENAME CONSTRAINT "Appointment_clientId_fkey" TO "Agendamento_clienteId_fkey";

-- RenameForeignKey
ALTER TABLE "Agendamento" RENAME CONSTRAINT "Appointment_professionalId_fkey" TO "Agendamento_profissionalId_fkey";

-- RenameForeignKey
ALTER TABLE "Agendamento" RENAME CONSTRAINT "Appointment_salonId_fkey" TO "Agendamento_salaoId_fkey";

-- RenameForeignKey
ALTER TABLE "Agendamento" RENAME CONSTRAINT "Appointment_serviceId_fkey" TO "Agendamento_servicoId_fkey";

-- RenameForeignKey
ALTER TABLE "Ausencia" RENAME CONSTRAINT "TimeOff_professionalId_fkey" TO "Ausencia_profissionalId_fkey";

-- RenameForeignKey
ALTER TABLE "Ausencia" RENAME CONSTRAINT "TimeOff_salonId_fkey" TO "Ausencia_salaoId_fkey";

-- RenameForeignKey
ALTER TABLE "Cliente" RENAME CONSTRAINT "Client_salonId_fkey" TO "Cliente_salaoId_fkey";

-- RenameForeignKey
ALTER TABLE "HorarioTrabalho" RENAME CONSTRAINT "WorkingHour_professionalId_fkey" TO "HorarioTrabalho_profissionalId_fkey";

-- RenameForeignKey
ALTER TABLE "HorarioTrabalho" RENAME CONSTRAINT "WorkingHour_salonId_fkey" TO "HorarioTrabalho_salaoId_fkey";

-- RenameForeignKey
ALTER TABLE "Profissional" RENAME CONSTRAINT "Professional_salonId_fkey" TO "Profissional_salaoId_fkey";

-- RenameForeignKey
ALTER TABLE "Servico" RENAME CONSTRAINT "Service_salonId_fkey" TO "Servico_salaoId_fkey";

-- RenameForeignKey
ALTER TABLE "ServicoProfissional" RENAME CONSTRAINT "ServiceProfessional_professionalId_fkey" TO "ServicoProfissional_profissionalId_fkey";

-- RenameForeignKey
ALTER TABLE "ServicoProfissional" RENAME CONSTRAINT "ServiceProfessional_salonId_fkey" TO "ServicoProfissional_salaoId_fkey";

-- RenameForeignKey
ALTER TABLE "ServicoProfissional" RENAME CONSTRAINT "ServiceProfessional_serviceId_fkey" TO "ServicoProfissional_servicoId_fkey";

-- RenameForeignKey
ALTER TABLE "Usuario" RENAME CONSTRAINT "User_salonId_fkey" TO "Usuario_salaoId_fkey";

-- RenameIndex
ALTER INDEX "Appointment_clientId_idx" RENAME TO "Agendamento_clienteId_idx";

-- RenameIndex
ALTER INDEX "Appointment_date_idx" RENAME TO "Agendamento_data_idx";

-- RenameIndex
ALTER INDEX "Appointment_professionalId_idx" RENAME TO "Agendamento_profissionalId_idx";

-- RenameIndex
ALTER INDEX "Appointment_salonId_idx" RENAME TO "Agendamento_salaoId_idx";

-- RenameIndex
ALTER INDEX "Appointment_serviceId_idx" RENAME TO "Agendamento_servicoId_idx";

-- RenameIndex
ALTER INDEX "TimeOff_professionalId_idx" RENAME TO "Ausencia_profissionalId_idx";

-- RenameIndex
ALTER INDEX "TimeOff_salonId_idx" RENAME TO "Ausencia_salaoId_idx";

-- RenameIndex
ALTER INDEX "Client_salonId_email_key" RENAME TO "Cliente_salaoId_email_key";

-- RenameIndex
ALTER INDEX "Client_salonId_phone_key" RENAME TO "Cliente_salaoId_telefone_key";

-- RenameIndex
ALTER INDEX "WorkingHour_professionalId_weekday_idx" RENAME TO "HorarioTrabalho_profissionalId_diaSemana_idx";

-- RenameIndex
ALTER INDEX "WorkingHour_salonId_idx" RENAME TO "HorarioTrabalho_salaoId_idx";

-- RenameIndex
ALTER INDEX "Professional_salonId_idx" RENAME TO "Profissional_salaoId_idx";

-- RenameIndex
ALTER INDEX "Salon_domain_key" RENAME TO "Salao_dominio_key";

-- RenameIndex
ALTER INDEX "Salon_slug_key" RENAME TO "Salao_slug_key";

-- RenameIndex
ALTER INDEX "Service_salonId_name_key" RENAME TO "Servico_salaoId_nome_key";

-- RenameIndex
ALTER INDEX "ServiceProfessional_professionalId_idx" RENAME TO "ServicoProfissional_profissionalId_idx";

-- RenameIndex
ALTER INDEX "ServiceProfessional_salonId_idx" RENAME TO "ServicoProfissional_salaoId_idx";

-- RenameIndex
ALTER INDEX "User_email_key" RENAME TO "Usuario_email_key";

-- RenameIndex
ALTER INDEX "User_salonId_idx" RENAME TO "Usuario_salaoId_idx";
