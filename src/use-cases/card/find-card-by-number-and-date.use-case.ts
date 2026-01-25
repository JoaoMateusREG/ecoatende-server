import { Card } from '../../entities/card';
import type { CardRepository } from '../../repositories/card.repository';
import { Inject } from '@nestjs/common';

export class FindCardByNumberAndDateUseCase {
  constructor(
    @Inject('CardRepository') private cardRepository: CardRepository,
  ) {}

  async execute(cardNumber: string, date: Date): Promise<Card | null> {
    return this.cardRepository.findByNumberAndDate(cardNumber, date);
  }
}
