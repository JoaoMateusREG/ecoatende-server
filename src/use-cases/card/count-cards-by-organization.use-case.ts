import type { CardRepository } from '../../repositories/card.repository';
import { Inject } from '@nestjs/common';

export class CountCardsByOrganizationUseCase {
  constructor(
    @Inject('CardRepository') private cardRepository: CardRepository,
  ) {}

  async execute(organizationCnpj: string): Promise<number> {
    return this.cardRepository.countPendingByOrganization(organizationCnpj);
  }
}
