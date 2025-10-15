import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { CreateSubscriptionUseCase } from '../use-cases/subscription/create-subscription.use-case';
import { UpdateSubscriptionUseCase } from '../use-cases/subscription/update-subscription.use-case';
import { DeleteSubscriptionUseCase } from '../use-cases/subscription/delete-subscription.use-case';
import { FindSubscriptionByIdUseCase } from '../use-cases/subscription/find-subscription-by-id.use-case';
import { FindSubscriptionByCustomerUseCase } from '../use-cases/subscription/find-subscription-by-customer.use-case';
import { FindSubscriptionByOrganizationUseCase } from '../use-cases/subscription/find-subscription-by-organization.use-case';
import { FindSubscriptionByStatusUseCase } from '../use-cases/subscription/find-subscription-by-status.use-case';
import { CreateSubscriptionDto } from '../dto/create-subscription.dto';
import { UpdateSubscriptionDto } from '../dto/update-subscription.dto';

@ApiTags('Subscriptions')
@Controller('subscriptions')
//@UseGuards(SessionAuthGuard)
export class SubscriptionController {
  constructor(
    private readonly createSubscriptionUseCase: CreateSubscriptionUseCase,
    private readonly updateSubscriptionUseCase: UpdateSubscriptionUseCase,
    private readonly deleteSubscriptionUseCase: DeleteSubscriptionUseCase,
    private readonly findSubscriptionByIdUseCase: FindSubscriptionByIdUseCase,
    private readonly findSubscriptionByCustomerUseCase: FindSubscriptionByCustomerUseCase,
    private readonly findSubscriptionByOrganizationUseCase: FindSubscriptionByOrganizationUseCase,
    private readonly findSubscriptionByStatusUseCase: FindSubscriptionByStatusUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar uma nova inscrição' })
  @ApiResponse({
    status: 201,
    description: 'Inscrição criada com sucesso.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'sub_1234567890' },
        dateCreated: {
          type: 'string',
          format: 'date-time',
          example: '2023-10-01T12:00:00Z',
        },
        customer: { type: 'string', example: 'customer_123456' },
        value: { type: 'number', example: 99.99 },
        nextDueDate: {
          type: 'string',
          format: 'date-time',
          example: '2023-11-01T12:00:00Z',
        },
        cycle: { type: 'string', example: 'monthly' },
        billingType: { type: 'string', example: 'credit_card' },
        status: { type: 'string', example: 'active' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async create(@Body('subscription') createSubscriptionDto: CreateSubscriptionDto) {
    try {
      const subscription = await this.createSubscriptionUseCase.execute(
        createSubscriptionDto,
      );
      return {
        id: subscription.id,
        dateCreated: subscription.dateCreated,
        customer: subscription.customer,
        value: subscription.value,
        nextDueDate: subscription.nextDueDate,
        cycle: subscription.cycle,
        billingType: subscription.billingType,
        status: subscription.status,
        organizationCnpj: subscription.organizationCnpj,
        organization: subscription.organization,
        payments: subscription.payments,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar uma inscrição existente' })
  @ApiParam({
    name: 'id',
    description: 'ID da inscrição',
    example: 'sub_1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Inscrição atualizada com sucesso.',
  })
  @ApiResponse({ status: 404, description: 'Inscrição não encontrada' })
  async update(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    try {
      const subscription = await this.findSubscriptionByIdUseCase.execute(id);
      if (!subscription) {
        throw new HttpException(
          'Inscrição não encontrada',
          HttpStatus.NOT_FOUND,
        );
      }

      const updatedSubscription = await this.updateSubscriptionUseCase.execute({
        ...subscription,
        ...updateSubscriptionDto,
        id,
      });

      return updatedSubscription;
    } catch (error: any) {
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar uma inscrição' })
  @ApiParam({
    name: 'id',
    description: 'ID da inscrição',
    example: 'sub_1234567890',
  })
  @ApiResponse({ status: 204, description: 'Inscrição deletada com sucesso' })
  async remove(@Param('id') id: string) {
    try {
      await this.deleteSubscriptionUseCase.execute(id);
    } catch (error: any) {
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter inscrição por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID da inscrição',
    example: 'sub_1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Inscrição encontrada com sucesso.',
  })
  @ApiResponse({ status: 404, description: 'Inscrição não encontrada' })
  async findById(@Param('id') id: string) {
    try {
      const subscription = await this.findSubscriptionByIdUseCase.execute(id);
      if (!subscription) {
        throw new HttpException(
          'Inscrição não encontrada',
          HttpStatus.NOT_FOUND,
        );
      }
      return subscription;
    } catch (error: any) {
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('customer/:customer')
  @ApiOperation({ summary: 'Obter inscrições por cliente' })
  @ApiParam({
    name: 'customer',
    description: 'ID do cliente',
    example: 'customer_123456',
  })
  @ApiResponse({
    status: 200,
    description: 'Inscrições encontradas com sucesso.',
  })
  @ApiResponse({ status: 404, description: 'Inscrições não encontradas' })
  async findByCustomer(@Param('customer') customer: string) {
    try {
      const subscriptions =
        await this.findSubscriptionByCustomerUseCase.execute(customer);
      if (!subscriptions || subscriptions.length === 0) {
        throw new HttpException(
          'Inscrições não encontradas',
          HttpStatus.NOT_FOUND,
        );
      }
      return subscriptions;
    } catch (error: any) {
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('organization/:cnpj')
  @ApiOperation({ summary: 'Obter inscrições por organização' })
  @ApiParam({
    name: 'cnpj',
    description: 'CNPJ da organização',
    example: '12.345.678/0001-90',
  })
  @ApiResponse({
    status: 200,
    description: 'Inscrições encontradas com sucesso.',
  })
  @ApiResponse({ status: 404, description: 'Inscrições não encontradas' })
  async findByOrganization(@Param('cnpj') organizationCnpj: string) {
    try {
      const subscriptions =
        await this.findSubscriptionByOrganizationUseCase.execute(
          organizationCnpj,
        );
      if (!subscriptions || subscriptions.length === 0) {
        throw new HttpException(
          'Inscrições não encontradas',
          HttpStatus.NOT_FOUND,
        );
      }
      return subscriptions;
    } catch (error: any) {
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Obter inscrições por status' })
  @ApiParam({
    name: 'status',
    description: 'Status da inscrição',
    example: 'active',
  })
  @ApiResponse({
    status: 200,
    description: 'Inscrições encontradas com sucesso.',
  })
  @ApiResponse({ status: 404, description: 'Inscrições não encontradas' })
  async findByStatus(@Param('status') status: string) {
    try {
      const subscriptions =
        await this.findSubscriptionByStatusUseCase.execute(status);
      if (!subscriptions || subscriptions.length === 0) {
        throw new HttpException(
          'Inscrições não encontradas',
          HttpStatus.NOT_FOUND,
        );
      }
      return subscriptions;
    } catch (error: any) {
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }
}
