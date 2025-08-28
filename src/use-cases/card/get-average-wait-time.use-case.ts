import { Inject } from "@nestjs/common";
import type { CardRepository } from "../../repositories/card.repository";

export class GetAverageWaitTimeUseCase {
  constructor(
    @Inject('CardRepository') private cardRepository: CardRepository
  ) {}

  async execute(organizationCnpj: string, startDate: Date, endDate: Date, serviceId?: number): Promise<number> {
    return await this.cardRepository.getAverageWaitTime(organizationCnpj, startDate, endDate, serviceId);
  }
}
