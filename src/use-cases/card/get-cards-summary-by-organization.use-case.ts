import type { CardRepository } from "../../repositories/card.repository";
import { Inject } from "@nestjs/common";

export interface CardsSummary {
  pending: number;
  inAttendance: number;
  concludedToday: number;
}

export class GetCardsSummaryByOrganizationUseCase {
  constructor(@Inject('CardRepository') private cardRepository: CardRepository) {}

  async execute(organizationCnpj: string): Promise<CardsSummary> {
    const [pending, inAttendance, concludedToday] = await Promise.all([
      this.cardRepository.countPendingByOrganization(organizationCnpj),
      this.cardRepository.countInAttendanceByOrganization(organizationCnpj),
      this.cardRepository.countConcludedTodayByOrganization(organizationCnpj)
    ]);

    return {
      pending,
      inAttendance,
      concludedToday
    };
  }
}
