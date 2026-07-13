-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELED');

-- AlterTable
ALTER TABLE "Salon"
  ADD COLUMN "document" TEXT,
  ADD COLUMN "legalName" TEXT,
  ADD COLUMN "ownerName" TEXT,
  ADD COLUMN "ownerPhone" TEXT,
  ADD COLUMN "ownerWhatsapp" TEXT,
  ADD COLUMN "ownerEmail" TEXT,
  ADD COLUMN "address" TEXT,
  ADD COLUMN "contractStatus" "ContractStatus" NOT NULL DEFAULT 'TRIAL',
  ADD COLUMN "contractDueDate" TIMESTAMP(3),
  ADD COLUMN "notes" TEXT;

-- O domínio salao.andre-aguiar-jr.com.br passa a ser da plataforma (página
-- institucional em "/"), não mais de um salão específico. O salão real
-- migra pra ser acessado por /:id como qualquer outro tenant.
UPDATE "Salon" SET "domain" = NULL WHERE "domain" = 'salao.andre-aguiar-jr.com.br';
