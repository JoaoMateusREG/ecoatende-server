-- CreateEnum
CREATE TYPE "public"."ServiceType" AS ENUM ('SERVICE', 'SUB_SERVICE');

-- AlterTable
ALTER TABLE "public"."Service" ADD COLUMN     "type" "public"."ServiceType" DEFAULT 'SERVICE';
