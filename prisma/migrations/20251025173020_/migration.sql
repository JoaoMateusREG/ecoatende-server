/*
  Warnings:

  - You are about to drop the column `subscriptionId` on the `Organization` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Subscription_customer_key";

-- DropIndex
DROP INDEX "public"."Subscription_organizationCnpj_key";

-- AlterTable
ALTER TABLE "public"."Organization" DROP COLUMN "subscriptionId";

-- AlterTable
ALTER TABLE "public"."Payment" ADD COLUMN     "invoiceUrl" TEXT;
