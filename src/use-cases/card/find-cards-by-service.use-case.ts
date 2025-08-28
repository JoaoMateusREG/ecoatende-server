import { Card } from "../../entities/card";
import type { CardRepository } from "../../repositories/card.repository";
import { Inject } from "@nestjs/common";

export class FindCardsByServiceUseCase {
  constructor(@Inject('CardRepository') private cardRepository: CardRepository) {}

  async execute(serviceId: number): Promise<Card[]> {
    return this.cardRepository.findByServiceId(serviceId);
  }
} 