import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CreatedSubscriptionUseCase } from 'src/use-cases/gateway-webhooks/created-subscription.use-case';
import { CreateSubscriptionUseCase } from 'src/use-cases/gateway-webhooks/create-subscription.use-case';
import type { GatewayCreateSubscription } from 'src/dto/gateway-subscription';
import type { GatewaySubscriptionWebhook } from 'src/dto/gateway-subscription';

@ApiTags('Gateway')
@Controller('gateway')
export class GatewayController {
  constructor(
    private readonly createdSubscriptionUseCase: CreatedSubscriptionUseCase,
    private readonly createSubscriptionUseCase: CreateSubscriptionUseCase,
  ) {}

  @Post('webhooks/responses')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Inscrição criada com sucesso' })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou falha no Gateway',
  })
  async createdSubscription(@Body() gatewaySubscription: GatewaySubscriptionWebhook) {
    await this.createdSubscriptionUseCase.execute(gatewaySubscription);
    console.log(gatewaySubscription);
    return { message: 'Webhook recebido' };
  }

  @Post('subscriptions')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Inscrição criada com sucesso' })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou falha no Gateway',
  })
  async createSubscription(@Body() createSubscription: GatewayCreateSubscription) {
    await this.createSubscriptionUseCase.execute(createSubscription);
    return { message: 'Inscrição criada com sucesso' };
  }
}
