-- CreateTable
CREATE TABLE "ServiceProfessional" (
    "serviceId" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,

    CONSTRAINT "ServiceProfessional_pkey" PRIMARY KEY ("serviceId", "professionalId")
);

-- CreateIndex
CREATE INDEX "ServiceProfessional_professionalId_idx" ON "ServiceProfessional"("professionalId");

-- CreateIndex
CREATE INDEX "ServiceProfessional_salonId_idx" ON "ServiceProfessional"("salonId");

-- AddForeignKey
ALTER TABLE "ServiceProfessional" ADD CONSTRAINT "ServiceProfessional_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceProfessional" ADD CONSTRAINT "ServiceProfessional_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "Professional"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceProfessional" ADD CONSTRAINT "ServiceProfessional_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
