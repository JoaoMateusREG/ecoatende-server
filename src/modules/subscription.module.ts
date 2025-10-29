import { Module } from '@nestjs/common';
import { CreateSubscriptionUseCase } from '../use-cases/subscription/create-subscription.use-case';
import { CreateSubscriptionGatewayUseCase } from '../use-cases/subscription/create-subscription-gateway.use-case';
import { UpdateSubscriptionGatewayUseCase } from '../use-cases/subscription/update-subscription.use-case';
import { DeleteSubscriptionUseCase } from '../use-cases/subscription/delete-subscription.use-case';
import { FindSubscriptionByIdUseCase } from 'src/use-cases/subscription/find-subscription-by-id.use-case';
import { FindSubscriptionByCustomerUseCase } from 'src/use-cases/subscription/find-subscription-by-customer.use-case';
import { FindSubscriptionByOrganizationUseCase } from 'src/use-cases/subscription/find-subscription-by-organization.use-case';
import { FindSubscriptionByStatusUseCase } from 'src/use-cases/subscription/find-subscription-by-status.use-case';
import { PrismaSubscriptionRepository } from '../repositories/prisma/prisma-subscription.repository';
import { SubscriptionController } from '../controllers/subscription.controller';
import { AuthModule } from '../auth/auth.module';
import { PrismaOrganizationRepository } from 'src/repositories/prisma/prisma-organization.repository';

@Module({
  imports: [AuthModule],
  controllers: [SubscriptionController],
  providers: [
    CreateSubscriptionUseCase,
    CreateSubscriptionGatewayUseCase,
    UpdateSubscriptionGatewayUseCase,
    DeleteSubscriptionUseCase,
    FindSubscriptionByIdUseCase,
    FindSubscriptionByCustomerUseCase,
    FindSubscriptionByOrganizationUseCase,
    FindSubscriptionByStatusUseCase,
    {
      provide: 'SubscriptionRepository',
      useClass: PrismaSubscriptionRepository,
    },
    {
      provide: 'OrganizationRepository',
      useClass: PrismaOrganizationRepository
    }
  ]
})
export class SubscriptionModule {} 