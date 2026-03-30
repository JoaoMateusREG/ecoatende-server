import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AsaasWebhookGuard } from '../auth/asaas-webhook.guard';
import { CreatePaymentUseCase } from '../use-cases/payment/create-payment.use-case';
import { CreateSubscriptionUseCase } from '../use-cases/subscription/create-subscription.use-case';
import { SendMessage } from '../services/notification.service';

const PAYMENT_EVENTS = [
  'PAYMENT_CREATED',
  'PAYMENT_UPDATED',
  'PAYMENT_CONFIRMED',
  'PAYMENT_RECEIVED',
  'PAYMENT_OVERDUE',
  'PAYMENT_DELETED',
  'PAYMENT_RESTORED',
  'PAYMENT_REFUNDED',
  'PAYMENT_CHARGEBACK_REQUESTED',
  'PAYMENT_CHARGEBACK_DISPUTE',
  'PAYMENT_AWAITING_CHARGEBACK_REVERSAL',
  'PAYMENT_DUNNING_RECEIVED',
  'PAYMENT_DUNNING_REQUESTED',
  'PAYMENT_BANK_SLIP_VIEWED',
  'PAYMENT_CHECKOUT_VIEWED',
];

@ApiTags('Webhook')
@Controller('webhook')
@UseGuards(AsaasWebhookGuard)
export class WebhookController {
  constructor(
    private readonly createPaymentUseCase: CreatePaymentUseCase,
    private readonly createSubscriptionUseCase: CreateSubscriptionUseCase,
  ) {}

  @Post('asaas')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Endpoint unificado para webhooks do Asaas' })
  async handle(@Body() body: any) {
    const { event, payment, subscription } = body;

    // Evento de assinatura — propaga erro para o Asaas retentar
    if (subscription && event === 'PAYMENT_CREATED') {
      await this.createSubscriptionUseCase.execute(subscription);
      SendMessage(
        'Nova assinatura recebida',
        `Assinatura criada/atualizada para o cliente ${subscription.customer} | Valor: R$ ${subscription.value}`,
        '10',
      );
      return { success: true, handled: 'subscription' };
    }

    // Pagamento vinculado a assinatura — propaga erro para o Asaas retentar
    if (payment && payment.subscription && PAYMENT_EVENTS.includes(event)) {
      await this.createPaymentUseCase.execute(payment);
      SendMessage(
        `Pagamento: ${event}`,
        `Cliente: ${payment.customer} | Valor: R$ ${payment.value} | Status: ${payment.status}`,
        '10',
      );
      return { success: true, handled: 'payment' };
    }

    // Pagamento sem assinatura (Pix avulso, etc.) — ignora silenciosamente
    if (payment && !payment.subscription) {
      SendMessage(
        'Webhook ignorado',
        `Evento [${event}] recebido sem assinatura vinculada | Pagamento: ${payment.id} | Cliente: ${payment.customer} | Valor: R$ ${payment.value}`,
        '1',
      );
      return { success: true, handled: 'ignored' };
    }

    // Evento não mapeado — ignora silenciosamente
    return { success: true, handled: 'ignored', event };
  }
}
