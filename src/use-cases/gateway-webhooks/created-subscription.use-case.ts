import { GatewayRepository } from 'src/repositories/gateway.repository';
import { GatewaySubscriptionWebhook } from 'src/dto/gateway-subscription';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CreatedSubscriptionUseCase {
  constructor(private gatewayRepository: GatewayRepository
  ) {}

  async execute(createSubscription: GatewaySubscriptionWebhook) {
    const createdsubscription = {
      id: createSubscription.id,
      event: createSubscription.event,
      dateCreated: createSubscription.dateCreated,
      subscription: {
        object: createSubscription.subscription.object,
        id: createSubscription.subscription.id,
        dateCreated: createSubscription.subscription.dateCreated,
        customer: createSubscription.subscription.customer,
        paymentLink: createSubscription.subscription.paymentLink ?? null,
        value: createSubscription.subscription.value,
        nextDueDate: createSubscription.subscription.nextDueDate,
        cycle: createSubscription.subscription.cycle,
        description: createSubscription.subscription.description,
        billingType: createSubscription.subscription.billingType,
        deleted: createSubscription.subscription.deleted,
        status: createSubscription.subscription.status,
      },
    };

    return this.gatewayRepository.createdSubscriptionWebhook(createdsubscription);
  }
}
