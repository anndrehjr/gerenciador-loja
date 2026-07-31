-- Traduz todo o schema pra português: tabelas, colunas e enums. Só
-- renomeia (RENAME) em vez de recriar — nenhum dado é perdido ou migrado,
-- é a mesma linha, só com nome novo.

-- ==================== Enums ====================
ALTER TYPE "Role" RENAME TO "Papel";
ALTER TYPE "Papel" RENAME VALUE 'ADMIN' TO 'ADMINISTRADOR';
ALTER TYPE "Papel" RENAME VALUE 'MASTER' TO 'MESTRE';

ALTER TYPE "SalonStatus" RENAME TO "StatusSalao";
ALTER TYPE "StatusSalao" RENAME VALUE 'ACTIVE' TO 'ATIVO';
ALTER TYPE "StatusSalao" RENAME VALUE 'SUSPENDED' TO 'SUSPENSO';

ALTER TYPE "ContractStatus" RENAME TO "StatusContrato";
ALTER TYPE "StatusContrato" RENAME VALUE 'TRIAL' TO 'TESTE';
ALTER TYPE "StatusContrato" RENAME VALUE 'ACTIVE' TO 'ATIVO';
ALTER TYPE "StatusContrato" RENAME VALUE 'PAST_DUE' TO 'ATRASADO';
ALTER TYPE "StatusContrato" RENAME VALUE 'CANCELED' TO 'CANCELADO';

-- Valores já estavam em português, só o nome do tipo muda
ALTER TYPE "SalonCategory" RENAME TO "CategoriaSalao";

-- Idem — status de agendamento já era todo em português
ALTER TYPE "AppointmentStatus" RENAME TO "StatusAgendamento";

-- ==================== Salon -> Salao ====================
ALTER TABLE "Salon" RENAME TO "Salao";
ALTER TABLE "Salao" RENAME COLUMN "name" TO "nome";
ALTER TABLE "Salao" RENAME COLUMN "domain" TO "dominio";
ALTER TABLE "Salao" RENAME COLUMN "plan" TO "plano";
ALTER TABLE "Salao" RENAME COLUMN "category" TO "categoria";
ALTER TABLE "Salao" RENAME COLUMN "logoUrl" TO "urlLogo";
ALTER TABLE "Salao" RENAME COLUMN "bannerUrl" TO "urlBanner";
ALTER TABLE "Salao" RENAME COLUMN "primaryColor" TO "corPrimaria";
ALTER TABLE "Salao" RENAME COLUMN "document" TO "documento";
ALTER TABLE "Salao" RENAME COLUMN "legalName" TO "razaoSocial";
ALTER TABLE "Salao" RENAME COLUMN "tradeName" TO "nomeFantasia";
ALTER TABLE "Salao" RENAME COLUMN "ownerName" TO "nomeProprietario";
ALTER TABLE "Salao" RENAME COLUMN "ownerPhone" TO "telefoneProprietario";
ALTER TABLE "Salao" RENAME COLUMN "ownerWhatsapp" TO "whatsappProprietario";
ALTER TABLE "Salao" RENAME COLUMN "ownerEmail" TO "emailProprietario";
ALTER TABLE "Salao" RENAME COLUMN "city" TO "cidade";
ALTER TABLE "Salao" RENAME COLUMN "state" TO "estado";
ALTER TABLE "Salao" RENAME COLUMN "zipCode" TO "cep";
ALTER TABLE "Salao" RENAME COLUMN "customization" TO "personalizacao";
ALTER TABLE "Salao" RENAME COLUMN "address" TO "endereco";
ALTER TABLE "Salao" RENAME COLUMN "contractStatus" TO "statusContrato";
ALTER TABLE "Salao" RENAME COLUMN "contractDueDate" TO "vencimentoContrato";
ALTER TABLE "Salao" RENAME COLUMN "notes" TO "observacoes";
ALTER TABLE "Salao" RENAME COLUMN "createdAt" TO "criadoEm";
ALTER TABLE "Salao" RENAME COLUMN "updatedAt" TO "atualizadoEm";

-- ==================== User -> Usuario ====================
ALTER TABLE "User" RENAME TO "Usuario";
ALTER TABLE "Usuario" RENAME COLUMN "name" TO "nome";
ALTER TABLE "Usuario" RENAME COLUMN "passwordHash" TO "senhaHash";
ALTER TABLE "Usuario" RENAME COLUMN "role" TO "papel";
ALTER TABLE "Usuario" RENAME COLUMN "salonId" TO "salaoId";
ALTER TABLE "Usuario" RENAME COLUMN "createdAt" TO "criadoEm";
ALTER TABLE "Usuario" RENAME COLUMN "updatedAt" TO "atualizadoEm";

-- ==================== Client -> Cliente ====================
ALTER TABLE "Client" RENAME TO "Cliente";
ALTER TABLE "Cliente" RENAME COLUMN "name" TO "nome";
ALTER TABLE "Cliente" RENAME COLUMN "phone" TO "telefone";
ALTER TABLE "Cliente" RENAME COLUMN "salonId" TO "salaoId";
ALTER TABLE "Cliente" RENAME COLUMN "createdAt" TO "criadoEm";
ALTER TABLE "Cliente" RENAME COLUMN "updatedAt" TO "atualizadoEm";

-- ==================== Service -> Servico ====================
ALTER TABLE "Service" RENAME TO "Servico";
ALTER TABLE "Servico" RENAME COLUMN "name" TO "nome";
ALTER TABLE "Servico" RENAME COLUMN "description" TO "descricao";
ALTER TABLE "Servico" RENAME COLUMN "priceCents" TO "precoCentavos";
ALTER TABLE "Servico" RENAME COLUMN "durationMinutes" TO "duracaoMinutos";
ALTER TABLE "Servico" RENAME COLUMN "active" TO "ativo";
ALTER TABLE "Servico" RENAME COLUMN "salonId" TO "salaoId";
ALTER TABLE "Servico" RENAME COLUMN "createdAt" TO "criadoEm";
ALTER TABLE "Servico" RENAME COLUMN "updatedAt" TO "atualizadoEm";

-- ==================== ServiceProfessional -> ServicoProfissional ====================
ALTER TABLE "ServiceProfessional" RENAME TO "ServicoProfissional";
ALTER TABLE "ServicoProfissional" RENAME COLUMN "serviceId" TO "servicoId";
ALTER TABLE "ServicoProfissional" RENAME COLUMN "professionalId" TO "profissionalId";
ALTER TABLE "ServicoProfissional" RENAME COLUMN "salonId" TO "salaoId";

-- ==================== Professional -> Profissional ====================
ALTER TABLE "Professional" RENAME TO "Profissional";
ALTER TABLE "Profissional" RENAME COLUMN "name" TO "nome";
ALTER TABLE "Profissional" RENAME COLUMN "photoUrl" TO "urlFoto";
ALTER TABLE "Profissional" RENAME COLUMN "specialty" TO "especialidade";
ALTER TABLE "Profissional" RENAME COLUMN "active" TO "ativo";
ALTER TABLE "Profissional" RENAME COLUMN "salonId" TO "salaoId";
ALTER TABLE "Profissional" RENAME COLUMN "createdAt" TO "criadoEm";
ALTER TABLE "Profissional" RENAME COLUMN "updatedAt" TO "atualizadoEm";

-- ==================== WorkingHour -> HorarioTrabalho ====================
ALTER TABLE "WorkingHour" RENAME TO "HorarioTrabalho";
ALTER TABLE "HorarioTrabalho" RENAME COLUMN "weekday" TO "diaSemana";
ALTER TABLE "HorarioTrabalho" RENAME COLUMN "startMinute" TO "minutoInicio";
ALTER TABLE "HorarioTrabalho" RENAME COLUMN "endMinute" TO "minutoFim";
ALTER TABLE "HorarioTrabalho" RENAME COLUMN "professionalId" TO "profissionalId";
ALTER TABLE "HorarioTrabalho" RENAME COLUMN "salonId" TO "salaoId";
ALTER TABLE "HorarioTrabalho" RENAME COLUMN "createdAt" TO "criadoEm";
ALTER TABLE "HorarioTrabalho" RENAME COLUMN "updatedAt" TO "atualizadoEm";

-- ==================== TimeOff -> Ausencia ====================
ALTER TABLE "TimeOff" RENAME TO "Ausencia";
ALTER TABLE "Ausencia" RENAME COLUMN "startDate" TO "dataInicio";
ALTER TABLE "Ausencia" RENAME COLUMN "endDate" TO "dataFim";
ALTER TABLE "Ausencia" RENAME COLUMN "reason" TO "motivo";
ALTER TABLE "Ausencia" RENAME COLUMN "professionalId" TO "profissionalId";
ALTER TABLE "Ausencia" RENAME COLUMN "salonId" TO "salaoId";
ALTER TABLE "Ausencia" RENAME COLUMN "createdAt" TO "criadoEm";

-- ==================== Appointment -> Agendamento ====================
ALTER TABLE "Appointment" RENAME TO "Agendamento";
ALTER TABLE "Agendamento" RENAME COLUMN "date" TO "data";
ALTER TABLE "Agendamento" RENAME COLUMN "notes" TO "observacoes";
ALTER TABLE "Agendamento" RENAME COLUMN "reminderSentAt" TO "lembreteEnviadoEm";
ALTER TABLE "Agendamento" RENAME COLUMN "clientId" TO "clienteId";
ALTER TABLE "Agendamento" RENAME COLUMN "serviceId" TO "servicoId";
ALTER TABLE "Agendamento" RENAME COLUMN "professionalId" TO "profissionalId";
ALTER TABLE "Agendamento" RENAME COLUMN "salonId" TO "salaoId";
ALTER TABLE "Agendamento" RENAME COLUMN "createdAt" TO "criadoEm";
ALTER TABLE "Agendamento" RENAME COLUMN "updatedAt" TO "atualizadoEm";
