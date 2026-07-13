-- CreateEnum
CREATE TYPE "SalonCategory" AS ENUM ('FEMININO', 'BARBEARIA', 'UNISSEX', 'ESTETICA', 'OUTROS');

-- AlterTable
ALTER TABLE "Salon"
  ADD COLUMN "category" "SalonCategory" NOT NULL DEFAULT 'OUTROS',
  ADD COLUMN "city" TEXT,
  ADD COLUMN "state" TEXT,
  ADD COLUMN "zipCode" TEXT,
  ADD COLUMN "tradeName" TEXT,
  ADD COLUMN "customization" JSONB;

-- "starter" era o único valor usado até aqui; migra pro novo vocabulário
-- START/PRO/PREMIUM antes de qualquer código passar a exigi-lo.
UPDATE "Salon" SET "plan" = 'START' WHERE "plan" = 'starter';
ALTER TABLE "Salon" ALTER COLUMN "plan" SET DEFAULT 'START';
