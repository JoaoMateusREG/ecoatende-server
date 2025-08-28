import { Card } from "../../entities/card";
import type { CardRepository } from "../../repositories/card.repository";
import { Inject } from "@nestjs/common";

export class FindCardByIdUseCase {
  constructor(@Inject('CardRepository') private cardRepository: CardRepository) {}

  async execute(id: number): Promise<Card | null> {
    return this.cardRepository.findById(id);
  }
} 