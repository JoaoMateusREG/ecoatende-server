import { Module } from '@nestjs/common';
import { CreatePaymentUseCase } from '../use-cases/payment/create-payment.use-case';
import { UpdatePaymentUseCase } from '../use-cases/payment/update-payment.use-case';
import { DeletePaymentUseCase } from '../use-cases/payment/delete-payment.use-case';
import { FindPaymentByCustomerUseCase } from '../use-cases/payment/find-by-customer.use-case';
import { FindPaymentByIdUseCase } from '../use-cases/payment/find-payment-by-id.use-case';
import { FindPaymentBySubscriptionUseCase } from '../use-cases/payment/find-payment-by-subscription.use-case';
import { PaymentController } from '../controllers/payment.controller';
import { PrismaPaymentsRepository } from '../repositories/prisma/prisma-payments.repository';
import { AuthModule } from '../auth/auth.module';
import { PrismaOrganizationRepository } from '../repositories/prisma/prisma-organization.repository';

@Module({
  imports: [AuthModule],
  controllers: [PaymentController],
  providers: [
    CreatePaymentUseCase,
    UpdatePaymentUseCase,
    DeletePaymentUseCase,
    FindPaymentByCustomerUseCase,
    FindPaymentByIdUseCase,
    FindPaymentBySubscriptionUseCase,
    {
      provide: 'PaymentRepository',
      useClass: PrismaPaymentsRepository,
    },
    {
      provide: 'OrganizationRepository',
      useClass: PrismaOrganizationRepository,
    },
  ],
})
export class PaymentModule {}
