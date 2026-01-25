import { Inject } from '@nestjs/common';
import type { SubscriptionRepository } from '../../repositories/subscription.repository';

export class DeleteSubscriptionUseCase {
  constructor(
    @Inject('SubscriptionRepository')
    private subscriptionRepository: SubscriptionRepository,
  ) {}

  async execute(id: string): Promise<void> {
    return this.subscriptionRepository.delete(id);
  }
}
