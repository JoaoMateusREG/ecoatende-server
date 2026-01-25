/*
  Warnings:

  - Added the required column `organizationCnpj` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Payment" ADD COLUMN     "organizationCnpj" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_organizationCnpj_fkey" FOREIGN KEY ("organizationCnpj") REFERENCES "public"."Organization"("cnpj") ON DELETE RESTRICT ON UPDATE CASCADE;
