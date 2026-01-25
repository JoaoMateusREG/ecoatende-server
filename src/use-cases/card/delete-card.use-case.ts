import type { CardRepository } from '../../repositories/card.repository';
import { Inject } from '@nestjs/common';

export class DeleteCardUseCase {
  constructor(
    @Inject('CardRepository') private cardRepository: CardRepository,
  ) {}

  async execute(id: number): Promise<void> {
    return this.cardRepository.delete(id);
  }
}
