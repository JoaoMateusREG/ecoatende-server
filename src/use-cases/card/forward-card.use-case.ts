import { Card } from '../../entities/card';
import type { CardRepository } from '../../repositories/card.repository';
import type { ServiceRepository } from '../../repositories/service.repository';
import { Inject } from '@nestjs/common';

export class ForwardCardUseCase {
  constructor(
    @Inject('CardRepository') private cardRepository: CardRepository,
    @Inject('ServiceRepository') private serviceRepository: ServiceRepository,
  ) {}

  async execute(cardId: number, targetServiceId: number): Promise<Card> {
    const card = await this.cardRepository.findById(cardId);
    if (!card) {
      throw new Error('Ficha não encontrada');
    }

    const targetService = await this.serviceRepository.findById(targetServiceId);
    if (!targetService) {
      throw new Error('Serviço de destino não encontrado');
    }

    if (!targetService.canCreateCards) {
      throw new Error('O serviço de destino não aceita fichas');
    }

    const updatedCard = Card.create({
      ...card,
      serviceId: targetServiceId,
    });

    return this.cardRepository.update(updatedCard);
  }
}
