-- AlterTable
ALTER TABLE "public"."Organization" ADD COLUMN     "subscriptionId" TEXT;

-- CreateTable
CREATE TABLE "public"."Subscription" (
    "id" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customer" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "nextDueDate" TIMESTAMP(3) NOT NULL,
    "cycle" TEXT NOT NULL,
    "billingType" TEXT,
    "status" TEXT,
    "organizationCnpj" TEXT NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customer" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "originalDueDate" TIMESTAMP(3) NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "netValue" DOUBLE PRECISION NOT NULL,
    "originalValue" DOUBLE PRECISION,
    "billingType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "transactionReceiptUrl" TEXT,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_customer_key" ON "public"."Subscription"("customer");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_organizationCnpj_key" ON "public"."Subscription"("organizationCnpj");

-- AddForeignKey
ALTER TABLE "public"."Subscription" ADD CONSTRAINT "Subscription_organizationCnpj_fkey" FOREIGN KEY ("organizationCnpj") REFERENCES "public"."Organization"("cnpj") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "public"."Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
