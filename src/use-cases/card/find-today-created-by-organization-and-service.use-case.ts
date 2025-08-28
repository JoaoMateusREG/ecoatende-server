import { Card } from "../../entities/card";
import type { CardRepository } from "../../repositories/card.repository";
import { Inject } from "@nestjs/common";

export class FindTodayCreatedByOrganizationAndServiceUseCase {
  constructor(@Inject('CardRepository') private cardRepository: CardRepository) {}

  async execute(organizationCnpj: string, serviceId: number): Promise<Card[]> {
    return this.cardRepository.findTodayCreatedByOrganizationAndService(organizationCnpj, serviceId);
  }
} 