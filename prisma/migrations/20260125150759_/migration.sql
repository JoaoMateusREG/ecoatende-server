/*
  Warnings:

  - Made the column `email` on table `Organization` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `Organization` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Card" DROP CONSTRAINT "Card_serviceId_fkey";

-- AlterTable
ALTER TABLE "public"."Organization" ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "phone" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Card" ADD CONSTRAINT "Card_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
