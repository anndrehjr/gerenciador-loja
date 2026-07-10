-- Add unique constraints to support idempotent upserts and avoid duplicate records
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");
CREATE UNIQUE INDEX "Service_name_key" ON "Service"("name");
