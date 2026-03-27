-- CreateTable
CREATE TABLE "public"."Panel" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "headerBg" TEXT NOT NULL,
    "logoBg" TEXT NOT NULL,
    "alertBg" TEXT NOT NULL,
    "currentCardBg" TEXT NOT NULL,
    "headerText" TEXT NOT NULL,
    "marqueeText" TEXT NOT NULL,
    "titleText" TEXT NOT NULL,
    "cardText" TEXT NOT NULL,
    "serviceText" TEXT NOT NULL,
    "currentCardText" TEXT NOT NULL,
    "youtubePlaylistId" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "organizationCnpj" TEXT NOT NULL,

    CONSTRAINT "Panel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Panel_organizationCnpj_key" ON "public"."Panel"("organizationCnpj");

-- AddForeignKey
ALTER TABLE "public"."Panel" ADD CONSTRAINT "Panel_organizationCnpj_fkey" FOREIGN KEY ("organizationCnpj") REFERENCES "public"."Organization"("cnpj") ON DELETE CASCADE ON UPDATE CASCADE;
