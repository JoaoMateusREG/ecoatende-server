import { Service } from "../../entities/service";
import type { ServiceRepository } from "../../repositories/service.repository";
import { Inject } from "@nestjs/common";

export class FindServiceByIdUseCase {
  constructor(@Inject('ServiceRepository') private serviceRepository: ServiceRepository) {}

  async execute(id: number): Promise<Service | null> {
    return this.serviceRepository.findById(id);
  }
} 