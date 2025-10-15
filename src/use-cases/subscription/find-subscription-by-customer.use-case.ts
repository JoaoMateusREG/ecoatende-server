import { Inject } from '@nestjs/common';
import { Subscription } from '../../entities/subscription';
import type { SubscriptionRepository } from '../../repositories/subscription.repository';

export class FindSubscriptionByCustomerUseCase {
  constructor(
    @Inject('SubscriptionRepository')
    private subscriptionRepository: SubscriptionRepository,
  ) {}
  async execute(customerId: string): Promise<Subscription[] | null> {
    return this.subscriptionRepository.findByCustomer(customerId);
  }
}
