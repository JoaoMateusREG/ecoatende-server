import { Module } from '@nestjs/common';
import { WebhookController } from '../controllers/webhook.controller';
import { CreatePaymentUseCase } from '../use-cases/payment/create-payment.use-case';
import { CreateSubscriptionUseCase } from '../use-cases/subscription/create-subscription.use-case';
import { PrismaPaymentsRepository } from '../repositories/prisma/prisma-payments.repository';
import { PrismaSubscriptionRepository } from '../repositories/prisma/prisma-subscription.repository';
import { PrismaOrganizationRepository } from '../repositories/prisma/prisma-organization.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [WebhookController],
  providers: [
    CreatePaymentUseCase,
    CreateSubscriptionUseCase,
    {
      provide: 'PaymentRepository',
      useClass: PrismaPaymentsRepository,
    },
    {
      provide: 'SubscriptionRepository',
      useClass: PrismaSubscriptionRepository,
    },
    {
      provide: 'OrganizationRepository',
      useClass: PrismaOrganizationRepository,
    },
  ],
})
export class WebhookModule {}
