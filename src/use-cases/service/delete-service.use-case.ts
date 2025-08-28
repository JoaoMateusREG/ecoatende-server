import type { ServiceRepository } from "../../repositories/service.repository";
import type { CardRepository } from "../../repositories/card.repository";
import { Inject } from "@nestjs/common";

export class DeleteServiceUseCase {
  constructor(
    @Inject('ServiceRepository') private serviceRepository: ServiceRepository,
    @Inject('CardRepository') private cardRepository: CardRepository
  ) {}

  async execute(id: number): Promise<void> {
    // Primeiro deleta todas as fichas associadas ao serviço
    await this.cardRepository.deleteByServiceId(id);
    
    // Depois deleta o serviço
    await this.serviceRepository.delete(id);
  }
} 