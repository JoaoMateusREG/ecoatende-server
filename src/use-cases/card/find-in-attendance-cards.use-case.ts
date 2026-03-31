import { Card } from '../../entities/card';
import type { CardRepository } from '../../repositories/card.repository';
import { Inject } from '@nestjs/common';

export class FindInAttendanceCardsUseCase {
  constructor(
    @Inject('CardRepository') private cardRepository: CardRepository,
  ) {}

  async execute(serviceIds?: number[], userCpf?: string): Promise<Card[]> {
    return this.cardRepository.findInAttendanceByServices(serviceIds, userCpf);
  }
}
