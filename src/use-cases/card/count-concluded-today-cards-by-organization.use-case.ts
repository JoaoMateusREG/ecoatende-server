import type { CardRepository } from '../../repositories/card.repository';
import { Inject } from '@nestjs/common';

export class CountConcludedTodayCardsByOrganizationUseCase {
  constructor(
    @Inject('CardRepository') private cardRepository: CardRepository,
  ) {}

  async execute(organizationCnpj: string): Promise<number> {
    return this.cardRepository.countConcludedTodayByOrganization(
      organizationCnpj,
    );
  }
}
