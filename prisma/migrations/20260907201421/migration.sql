-- CreateIndex
CREATE INDEX "Card_organizationCnpj_idx" ON "Card"("organizationCnpj");

-- CreateIndex
CREATE INDEX "Card_serviceId_idx" ON "Card"("serviceId");

-- CreateIndex
CREATE INDEX "Card_status_idx" ON "Card"("status");

-- CreateIndex
CREATE INDEX "Card_datehour_idx" ON "Card"("datehour");

-- CreateIndex
CREATE INDEX "Payment_organizationCnpj_idx" ON "Payment"("organizationCnpj");

-- CreateIndex
CREATE INDEX "Payment_subscriptionId_idx" ON "Payment"("subscriptionId");

-- CreateIndex
CREATE INDEX "Service_organizationCnpj_idx" ON "Service"("organizationCnpj");

-- CreateIndex
CREATE INDEX "Subscription_organizationCnpj_idx" ON "Subscription"("organizationCnpj");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "User_organizationCnpj_idx" ON "User"("organizationCnpj");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");
