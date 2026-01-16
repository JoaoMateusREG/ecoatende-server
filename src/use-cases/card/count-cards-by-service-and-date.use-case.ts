import type { CardRepository } from '../../repositories/card.repository';
import { Inject } from '@nestjs/common';

export class CountCardsByServiceAndDateUseCase {
  constructor(
    @Inject('CardRepository') private cardRepository: CardRepository,
  ) {}

  async execute(serviceId: number, date: Date): Promise<number> {
    return this.cardRepository.countByServiceAndDate(serviceId, date);
  }
}
