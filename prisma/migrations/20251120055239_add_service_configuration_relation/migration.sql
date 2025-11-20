/*
  Warnings:

  - You are about to drop the column `serviceId` on the `Configuration` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Configuration` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Configuration" DROP COLUMN "serviceId",
DROP COLUMN "type";

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "earnRateId" TEXT;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_earnRateId_fkey" FOREIGN KEY ("earnRateId") REFERENCES "Configuration"("id") ON DELETE SET NULL ON UPDATE CASCADE;
