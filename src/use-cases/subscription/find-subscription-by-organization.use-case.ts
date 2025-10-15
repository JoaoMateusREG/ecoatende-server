import { Inject } from '@nestjs/common';
import { Subscription } from '../../entities/subscription';
import type { SubscriptionRepository } from '../../repositories/subscription.repository';

export class FindSubscriptionByOrganizationUseCase {
  constructor(
    @Inject('SubscriptionRepository')
    private subscriptionRepository: SubscriptionRepository,
  ) {}
    async execute(organizationCnpj: string): Promise<Subscription[] | null> {
        return this.subscriptionRepository.findByOrganization(organizationCnpj);
            }
        }