-- Cria o salão que já está em produção como o primeiro tenant da plataforma,
-- e migra todo dado existente (clientes, serviços, profissionais,
-- agendamentos, usuário admin) para pertencer a ele. Nenhum dado é perdido.

INSERT INTO "Salon" (id, name, slug, domain, status, plan, "createdAt", "updatedAt")
VALUES ('default-salon-001', 'Salão', 'salao-andre', 'salao.andre-aguiar-jr.com.br', 'ACTIVE', 'starter', now(), now());

-- AddColumn (nullable por enquanto, pra poder fazer o backfill antes de travar)
ALTER TABLE "User" ADD COLUMN "salonId" TEXT;
ALTER TABLE "Client" ADD COLUMN "salonId" TEXT;
ALTER TABLE "Service" ADD COLUMN "salonId" TEXT;
ALTER TABLE "Professional" ADD COLUMN "salonId" TEXT;
ALTER TABLE "WorkingHour" ADD COLUMN "salonId" TEXT;
ALTER TABLE "TimeOff" ADD COLUMN "salonId" TEXT;
ALTER TABLE "Appointment" ADD COLUMN "salonId" TEXT;

-- Backfill: tudo que já existe pertence ao salão migrado
UPDATE "User" SET "salonId" = 'default-salon-001';
UPDATE "Client" SET "salonId" = 'default-salon-001';
UPDATE "Service" SET "salonId" = 'default-salon-001';
UPDATE "Professional" SET "salonId" = 'default-salon-001';
UPDATE "WorkingHour" SET "salonId" = 'default-salon-001';
UPDATE "TimeOff" SET "salonId" = 'default-salon-001';
UPDATE "Appointment" SET "salonId" = 'default-salon-001';

-- Trava NOT NULL onde faz sentido (User.salonId continua opcional — é null
-- pra usuários MASTER, que não pertencem a nenhum salão específico)
ALTER TABLE "Client" ALTER COLUMN "salonId" SET NOT NULL;
ALTER TABLE "Service" ALTER COLUMN "salonId" SET NOT NULL;
ALTER TABLE "Professional" ALTER COLUMN "salonId" SET NOT NULL;
ALTER TABLE "WorkingHour" ALTER COLUMN "salonId" SET NOT NULL;
ALTER TABLE "TimeOff" ALTER COLUMN "salonId" SET NOT NULL;
ALTER TABLE "Appointment" ALTER COLUMN "salonId" SET NOT NULL;

-- Troca as unicidades globais por unicidade por salão (dois salões diferentes
-- agora podem ter um serviço "Corte feminino" ou um cliente com o mesmo email)
DROP INDEX "Client_email_key";
DROP INDEX "Client_phone_key";
DROP INDEX "Service_name_key";

CREATE UNIQUE INDEX "Client_salonId_email_key" ON "Client"("salonId", "email");
CREATE UNIQUE INDEX "Client_salonId_phone_key" ON "Client"("salonId", "phone");
CREATE UNIQUE INDEX "Service_salonId_name_key" ON "Service"("salonId", "name");

CREATE INDEX "User_salonId_idx" ON "User"("salonId");
CREATE INDEX "Professional_salonId_idx" ON "Professional"("salonId");
CREATE INDEX "WorkingHour_salonId_idx" ON "WorkingHour"("salonId");
CREATE INDEX "TimeOff_salonId_idx" ON "TimeOff"("salonId");
CREATE INDEX "Appointment_salonId_idx" ON "Appointment"("salonId");

-- Foreign keys
ALTER TABLE "User" ADD CONSTRAINT "User_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Client" ADD CONSTRAINT "Client_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Service" ADD CONSTRAINT "Service_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Professional" ADD CONSTRAINT "Professional_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkingHour" ADD CONSTRAINT "WorkingHour_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TimeOff" ADD CONSTRAINT "TimeOff_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
