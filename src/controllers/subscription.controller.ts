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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CreateSubscriptionGatewayUseCase } from '../use-cases/subscription/create-subscription-gateway.use-case';
import { UpdateSubscriptionGatewayUseCase } from '../use-cases/subscription/update-subscription.use-case';
import { DeleteSubscriptionUseCase } from '../use-cases/subscription/delete-subscription.use-case';
import { FindSubscriptionByIdUseCase } from '../use-cases/subscription/find-subscription-by-id.use-case';
import { FindSubscriptionByCustomerUseCase } from '../use-cases/subscription/find-subscription-by-customer.use-case';
import { FindSubscriptionByOrganizationUseCase } from '../use-cases/subscription/find-subscription-by-organization.use-case';
import { FindSubscriptionByStatusUseCase } from '../use-cases/subscription/find-subscription-by-status.use-case';
import type { UpdateSubscriptionGatewayDto } from '../use-cases/subscription/update-subscription.use-case';
import type { CreateSubscriptionGatewayDto } from '../use-cases/subscription/create-subscription-gateway.use-case';
import type { CreateSubscriptionDto } from 'src/dto/create-subscription.dto';
import { CreateSubscriptionUseCase } from 'src/use-cases/subscription/create-subscription.use-case';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionController {
  constructor(
    private readonly createSubscriptionGatewayUseCase: CreateSubscriptionGatewayUseCase,
    private readonly createSubscriptionUseCase: CreateSubscriptionUseCase,
    private readonly updateSubscriptionGatewayUseCase: UpdateSubscriptionGatewayUseCase,
    private readonly deleteSubscriptionUseCase: DeleteSubscriptionUseCase,
    private readonly findSubscriptionByIdUseCase: FindSubscriptionByIdUseCase,
    private readonly findSubscriptionByCustomerUseCase: FindSubscriptionByCustomerUseCase,
    private readonly findSubscriptionByOrganizationUseCase: FindSubscriptionByOrganizationUseCase,
    private readonly findSubscriptionByStatusUseCase: FindSubscriptionByStatusUseCase,
  ) {}

  // rota que o site cria a inscricao no gateway
  @Post('gateway')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar uma nova inscrição no gateway de pagamento' })
  @ApiResponse({
    status: 200,
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
  async createGateway(@Body() createSubscriptionGatewayDto: CreateSubscriptionGatewayDto) {
    try {
      const subscription = await this.createSubscriptionGatewayUseCase.execute(
        createSubscriptionGatewayDto,
      );
      return {
      billingType: subscription.billingType,
      cycle: subscription.cycle,
      customer: subscription.customer,
      value: subscription.value,
      nextDueDate: subscription.nextDueDate,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  //rota que o webhook vai utilizar - precisa retornar sempre 200
@Post()
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Criar uma nova inscrição' })
@ApiResponse({
  status: 200,
  description: 'Inscrição criada com sucesso.',
  schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      data: {
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
    },
  },
})
@ApiResponse({
  status: 200,
  description: 'Erro ao criar inscrição',
  schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      error: { type: 'string', example: 'Mensagem de erro' },
    },
  },
})
async create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
  try {
    const subscription = await this.createSubscriptionUseCase.execute(
      createSubscriptionDto,
    );
    
    return {
      success: true,
      data: {
        billingType: subscription.billingType,
        cycle: subscription.cycle,
        customer: subscription.customer,
        value: subscription.value,
        nextDueDate: subscription.nextDueDate,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}


  @Put('id')
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
  async update(@Body() updateSubscriptionGatewayDto: UpdateSubscriptionGatewayDto) {
    try {
      const subscription = await this.updateSubscriptionGatewayUseCase.execute(
        updateSubscriptionGatewayDto,
      );
      return {
        id: subscription.id,
        customer: subscription.customer,
        nextDueDate: subscription.nextDueDate,
        billingType: subscription.billingType,
        status: subscription.status,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
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
