-- CreateTable
CREATE TABLE "public"."ServiceCounter" (
    "id" SERIAL NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "currentValue" INTEGER NOT NULL DEFAULT 0,
    "lastReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceCounter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCounter_serviceId_key" ON "public"."ServiceCounter"("serviceId");

-- AddForeignKey
ALTER TABLE "public"."ServiceCounter" ADD CONSTRAINT "ServiceCounter_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
