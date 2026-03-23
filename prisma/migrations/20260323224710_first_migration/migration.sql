-- CreateEnum
CREATE TYPE "public"."CardStatus" AS ENUM ('WAITING', 'CALLED', 'IN_ATTENDANCE', 'FINISHED');

-- CreateEnum
CREATE TYPE "public"."CardPriority" AS ENUM ('NORMAL', 'PREFERENTIAL', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'ORGANIZATION_ADMIN', 'USER');

-- CreateTable
CREATE TABLE "public"."Organization" (
    "cnpj" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "creationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerId" TEXT,
    "active" BOOLEAN DEFAULT true,
    "logo" TEXT,
    "gracePeriodDays" INTEGER,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("cnpj")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "cpf" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'USER',
    "organizationCnpj" TEXT NOT NULL,
    "picture" TEXT,
    "isActive" BOOLEAN DEFAULT true,

    CONSTRAINT "User_pkey" PRIMARY KEY ("cpf")
);

-- CreateTable
CREATE TABLE "public"."Service" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "prefix" VARCHAR(2) NOT NULL,
    "organizationCnpj" TEXT NOT NULL,
    "canCreateCards" BOOLEAN NOT NULL DEFAULT true,
    "cardLimit" INTEGER DEFAULT 150,
    "category" TEXT,
    "color" TEXT,

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
CREATE TABLE "public"."Subscription" (
    "id" TEXT NOT NULL,
    "dateCreated" TEXT NOT NULL,
    "customer" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "nextDueDate" TEXT NOT NULL,
    "cycle" TEXT NOT NULL,
    "billingType" TEXT,
    "status" TEXT,
    "organizationCnpj" TEXT NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" TEXT NOT NULL,
    "dateCreated" TEXT NOT NULL,
    "customer" TEXT NOT NULL,
    "organizationCnpj" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "dueDate" TEXT NOT NULL,
    "originalDueDate" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "netValue" DOUBLE PRECISION NOT NULL,
    "originalValue" DOUBLE PRECISION,
    "billingType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "invoiceUrl" TEXT,
    "transactionReceiptUrl" TEXT,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "Organization_email_key" ON "public"."Organization"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_customerId_key" ON "public"."Organization"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "User_cpf_key" ON "public"."User"("cpf");

-- CreateIndex
CREATE INDEX "_UserServices_B_index" ON "public"."_UserServices"("B");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_organizationCnpj_fkey" FOREIGN KEY ("organizationCnpj") REFERENCES "public"."Organization"("cnpj") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Service" ADD CONSTRAINT "Service_organizationCnpj_fkey" FOREIGN KEY ("organizationCnpj") REFERENCES "public"."Organization"("cnpj") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Card" ADD CONSTRAINT "Card_organizationCnpj_fkey" FOREIGN KEY ("organizationCnpj") REFERENCES "public"."Organization"("cnpj") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Card" ADD CONSTRAINT "Card_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Card" ADD CONSTRAINT "Card_userCpf_fkey" FOREIGN KEY ("userCpf") REFERENCES "public"."User"("cpf") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Subscription" ADD CONSTRAINT "Subscription_organizationCnpj_fkey" FOREIGN KEY ("organizationCnpj") REFERENCES "public"."Organization"("cnpj") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_organizationCnpj_fkey" FOREIGN KEY ("organizationCnpj") REFERENCES "public"."Organization"("cnpj") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "public"."Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_UserServices" ADD CONSTRAINT "_UserServices_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_UserServices" ADD CONSTRAINT "_UserServices_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("cpf") ON DELETE CASCADE ON UPDATE CASCADE;
