import { Inject } from '@nestjs/common';
import { Subscription } from '../../entities/subscription';
import type { SubscriptionRepository } from '../../repositories/subscription.repository';

export class FindSubscriptionByStatusUseCase {
  constructor(
    @Inject('SubscriptionRepository')
    private subscriptionRepository: SubscriptionRepository,
  ) {}
  async execute(status: string): Promise<Subscription[] | null> {
    return this.subscriptionRepository.findByStatus(status);
  }
}
