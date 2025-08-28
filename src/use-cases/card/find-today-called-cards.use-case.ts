import { Card } from "../../entities/card";
import type { CardRepository } from "../../repositories/card.repository";
import { Inject } from "@nestjs/common";

export class FindTodayCalledCardsUseCase {
  constructor(@Inject('CardRepository') private cardRepository: CardRepository) {}

  async execute(organizationCnpj: string): Promise<Card[]> {
    return this.cardRepository.findTodayCalledByOrganization(organizationCnpj);
  }
} 