import { Injectable } from '@nestjs/common';
import { GatewaySubscriptionWebhook } from 'src/dto/gateway-subscription';
import { GatewayCreateSubscription } from 'src/dto/gateway-subscription';
import { GatewayPaymentWebhook } from 'src/dto/gateway-payment';

@Injectable()
export class GatewayRepository {
  createdSubscriptionWebhook(subscription: GatewaySubscriptionWebhook) {}
  createSubscription(createsubscription: GatewayCreateSubscription) {}
  updateSubscriptionWebhook(subscription: GatewaySubscriptionWebhook) {}
  deleteSubscriptionWebhook(subscription: GatewaySubscriptionWebhook) {}
  createdPaymentWebhook(payment: GatewayPaymentWebhook) {}
  confirmedPaymentWebhook(payment: GatewayPaymentWebhook) {}
}
