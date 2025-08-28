import { Service } from "../../entities/service";
import type { ServiceRepository } from "../../repositories/service.repository";
import { Inject } from "@nestjs/common";

export class FindServiceByNameUseCase {
  constructor(@Inject('ServiceRepository') private serviceRepository: ServiceRepository) {}

  async execute(name: string): Promise<Service | null> {
    return this.serviceRepository.findByName(name);
  }
} 