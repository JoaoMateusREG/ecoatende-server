import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  HttpException,
  UseGuards
} from '@nestjs/common';
import { AsaasWebhookGuard } from '../auth/asaas-webhook.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CreatePaymentUseCase } from '../use-cases/payment/create-payment.use-case';
import { UpdatePaymentUseCase } from '../use-cases/payment/update-payment.use-case';
import { DeletePaymentUseCase } from '../use-cases/payment/delete-payment.use-case';
import { FindPaymentByIdUseCase } from '../use-cases/payment/find-payment-by-id.use-case';
import { FindPaymentBySubscriptionUseCase } from '../use-cases/payment/find-payment-by-subscription.use-case';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';
import { Subscription } from '../entities/subscription';
import { FindPaymentByCustomerUseCase } from '../use-cases/payment/find-by-customer.use-case';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  constructor(
    private readonly createPaymentUseCase: CreatePaymentUseCase,
    private readonly updatePaymentUseCase: UpdatePaymentUseCase,
    private readonly deletePaymentUseCase: DeletePaymentUseCase,
    private readonly findPaymentByIdUseCase: FindPaymentByIdUseCase,
    private readonly findPaymentBySubscriptionUseCase: FindPaymentBySubscriptionUseCase,
    private readonly findPaymentByCustomerUseCase: FindPaymentByCustomerUseCase,
  ) {}

  // rota utilizada pelo webhook para criar pagamento no sistema
  // DEPRECIADA: use POST /webhook/asaas

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar um pagamento existente' })
  @ApiParam({
    name: 'id',
    description: 'ID do pagamento a ser atualizado',
    example: 'pay_1234567890',
  })
  @ApiResponse({ status: 200, description: 'Pagamento criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Pagamento não encontrado' })
  async update(
    @Param('id') id: string,
    @Body() UpdatePaymentDto: UpdatePaymentDto,
  ) {
    try {
      const payment = await this.findPaymentBySubscriptionUseCase.execute(id);
      if (!payment) {
        throw new HttpException(
          'Pagamento não encontrado',
          HttpStatus.NOT_FOUND,
        );
      }

      const updatedPayment = await this.updatePaymentUseCase.execute({
        ...Subscription,
        ...UpdatePaymentDto,
        id,
      });
      return updatedPayment;
    } catch (error: any) {
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('id')
  @ApiOperation({ summary: 'Deletar um pagamento existente' })
  @ApiParam({
    name: 'id',
    description: 'ID do pagamento',
    example: 'pay_125613551',
  })
  @ApiResponse({
    status: 204,
    description: 'Pagamento deletado com sucesso',
  })
  async remove(@Param('id') id: string) {
    try {
      await this.deletePaymentUseCase.execute(id);
    } catch (error: any) {
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('id')
  @ApiOperation({ summary: 'Obter um pagamento pelo ID' })
  @ApiParam({
    name: 'id',
    description: 'ID do pagamento',
    example: 'pay_3212315614',
  })
  @ApiResponse({ status: 200, description: 'Pagamento encontrado com sucesso' })
  @ApiResponse({ status: 400, description: 'Pagamento não encontrado' })
  async findById(@Param('id') id: string) {
    try {
      const payment = await this.findPaymentByIdUseCase.execute(id);
      if (!payment) {
        throw new HttpException(
          'Pagamento não encontrado',
          HttpStatus.NOT_FOUND,
        );
      }
      return payment;
    } catch (error: any) {
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('subscription/:subscription')
  @ApiOperation({ summary: 'Obter um pagamento pelo ID da inscrição' })
  @ApiParam({
    name: 'id',
    description: 'ID da inscrição',
    example: 'sub_3212315614',
  })
  @ApiResponse({ status: 200, description: 'Pagamento encontrado com sucesso' })
  @ApiResponse({ status: 400, description: 'Pagamento não encontrado' })
  async findBySubscription(@Param('subscription') subscripton: string) {
    try {
      const payment =
        await this.findPaymentBySubscriptionUseCase.execute(subscripton);
      if (!payment) {
        throw new HttpException(
          'Pagamento não encontrado',
          HttpStatus.NOT_FOUND,
        );
      }
      return payment;
    } catch (error: any) {
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('customer/:customer')
  @ApiOperation({ summary: 'Obter um pagamento pelo ID do cliente' })
  @ApiParam({
    name: 'id',
    description: 'ID do cliente',
    example: 'cust_3212315614',
  })
  @ApiResponse({ status: 200, description: 'Pagamento encontrado com sucesso' })
  @ApiResponse({ status: 400, description: 'Pagamento não encontrado' })
  async findByCustomer(@Param('customer') customer: string) {
    try {
      const payment = await this.findPaymentByCustomerUseCase.execute(customer);
      if (!payment) {
        throw new HttpException(
          'Pagamento não encontrado',
          HttpStatus.NOT_FOUND,
        );
      }
      return payment;
    } catch (error: any) {
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }
}
