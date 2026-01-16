import { Inject } from '@nestjs/common';
import { Subscription } from '../../entities/subscription';
import type { SubscriptionRepository } from '../../repositories/subscription.repository';

export class FindSubscriptionByIdUseCase {
  constructor(
    @Inject('SubscriptionRepository')
    private subscriptionRepository: SubscriptionRepository,
  ) {}
  async execute(id: string): Promise<Subscription | null> {
    return this.subscriptionRepository.findById(id);
  }
}
