import { Inject } from '@nestjs/common';
import { Subscription } from '../../entities/subscription';
import type { SubscriptionRepository } from '../../repositories/subscription.repository';
import { CreateSubscriptionDto } from '../../dto/create-subscription.dto';
import type { OrganizationRepository } from 'src/repositories/organization.repository';

export class CreateSubscriptionUseCase {
  constructor(
    @Inject('SubscriptionRepository')
    private subscriptionRepository: SubscriptionRepository,
    @Inject('OrganizationRepository')
    private organizationRepository: OrganizationRepository,
  ) {}

  async execute(
    createSubscriptionDto: CreateSubscriptionDto,
  ): Promise<Subscription> {
    const organization = await this.organizationRepository.findByCustomer(
      createSubscriptionDto.customer,
    );

    const organizationCnpj: string = organization?.cnpj ?? '';

    const subscription = Subscription.create({
      id: createSubscriptionDto.id,
      dateCreated: createSubscriptionDto.dateCreated,
      customer: createSubscriptionDto.customer,
      value: createSubscriptionDto.value,
      nextDueDate: createSubscriptionDto.nextDueDate,
      cycle: createSubscriptionDto.cycle,
      billingType: createSubscriptionDto.billingType,
      status: createSubscriptionDto.status,
      organizationCnpj: organizationCnpj,
      payments: createSubscriptionDto.payments,
    });

      return this.subscriptionRepository.create(subscription);
  }
}
