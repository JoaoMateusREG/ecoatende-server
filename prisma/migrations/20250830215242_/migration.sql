-- AlterTable
ALTER TABLE "public"."Organization" ADD COLUMN     "active" BOOLEAN DEFAULT true,
ADD COLUMN     "logo" TEXT;

-- AlterTable
ALTER TABLE "public"."Service" ADD COLUMN     "category" TEXT,
ADD COLUMN     "color" TEXT;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "picture" TEXT;
