-- CreateEnum
CREATE TYPE "public"."CardStatus" AS ENUM ('WAITING', 'CALLED', 'IN_ATTENDANCE', 'FINISHED');

-- CreateEnum
CREATE TYPE "public"."CardPriority" AS ENUM ('NORMAL', 'PREFERENTIAL', 'URGENT');

-- CreateTable
CREATE TABLE "public"."Organization" (
    "cnpj" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("cnpj")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "cpf" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "organizationCnpj" TEXT NOT NULL,
    "isActive" BOOLEAN DEFAULT true,

    CONSTRAINT "User_pkey" PRIMARY KEY ("cpf")
);

-- CreateTable
CREATE TABLE "public"."Service" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "organizationCnpj" TEXT NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Card" (
    "id" SERIAL NOT NULL,
    "card" TEXT NOT NULL,
    "priority" "public"."CardPriority" NOT NULL DEFAULT 'NORMAL',
    "status" "public"."CardStatus" NOT NULL DEFAULT 'WAITING',
    "datehour" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "datehourAttend" TIMESTAMP(3),
    "concluded" BOOLEAN NOT NULL DEFAULT false,
    "datehourConcluded" TIMESTAMP(3),
    "organizationCnpj" TEXT NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "userCpf" TEXT,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_UserServices" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserServices_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_cnpj_key" ON "public"."Organization"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "User_cpf_key" ON "public"."User"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Card_card_key" ON "public"."Card"("card");

-- CreateIndex
CREATE INDEX "_UserServices_B_index" ON "public"."_UserServices"("B");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_organizationCnpj_fkey" FOREIGN KEY ("organizationCnpj") REFERENCES "public"."Organization"("cnpj") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Service" ADD CONSTRAINT "Service_organizationCnpj_fkey" FOREIGN KEY ("organizationCnpj") REFERENCES "public"."Organization"("cnpj") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Card" ADD CONSTRAINT "Card_organizationCnpj_fkey" FOREIGN KEY ("organizationCnpj") REFERENCES "public"."Organization"("cnpj") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Card" ADD CONSTRAINT "Card_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Card" ADD CONSTRAINT "Card_userCpf_fkey" FOREIGN KEY ("userCpf") REFERENCES "public"."User"("cpf") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_UserServices" ADD CONSTRAINT "_UserServices_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_UserServices" ADD CONSTRAINT "_UserServices_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("cpf") ON DELETE CASCADE ON UPDATE CASCADE;
