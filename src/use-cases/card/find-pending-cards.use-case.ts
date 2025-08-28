import { Card } from "../../entities/card";
import type { CardRepository } from "../../repositories/card.repository";
import { Inject } from "@nestjs/common";

export class FindPendingCardsUseCase {
  constructor(@Inject('CardRepository') private cardRepository: CardRepository) {}

  async execute(serviceIds?: number[]): Promise<Card[]> {
    return this.cardRepository.findPendingByServices(serviceIds);
  }
} 