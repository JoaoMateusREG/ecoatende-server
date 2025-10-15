import { Module } from '@nestjs/common';
import { GatewayController } from '../controllers/gateway.webhook.controller';
import { CreatedSubscriptionUseCase } from 'src/use-cases/gateway-webhooks/created-subscription.use-case';
import { GatewayRepository } from 'src/repositories/gateway.repository';
import { AuthModule } from '../auth/auth.module';
import { CreateSubscriptionUseCase } from 'src/use-cases/gateway-webhooks/create-subscription.use-case';

@Module({
  imports: [AuthModule],
  controllers: [GatewayController],
  providers: [CreatedSubscriptionUseCase, CreateSubscriptionUseCase, GatewayRepository],
})
export class GatewayModule {}
