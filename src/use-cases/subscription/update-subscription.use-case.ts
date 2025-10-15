import { Inject } from '@nestjs/common';
import { Subscription } from '../../entities/subscription';
import type { SubscriptionRepository } from '../../repositories/subscription.repository';
import { UpdateSubscriptionDto } from '../../dto/update-subscription.dto';

export class UpdateSubscriptionUseCase {
  constructor(
    @Inject('SubscriptionRepository')
    private subscriptionRepository: SubscriptionRepository,
  ) {}

  async execute( updateSubscriptionDto: UpdateSubscriptionDto & {id: string}): Promise<Subscription> {

    const existingSubscription = await this.subscriptionRepository.findById(updateSubscriptionDto.id);
    if (!existingSubscription) {
      throw new Error('Inscrição não encontrada');
    }

    const updatedSubscription = Subscription.create({
      ...existingSubscription,
      ...updateSubscriptionDto,
    });

    return this.subscriptionRepository.update(updatedSubscription);
  }
}