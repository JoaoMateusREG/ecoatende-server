import { Service } from "../../entities/service";
import type { ServiceRepository } from "../../repositories/service.repository";
import { Inject } from "@nestjs/common";

export class FindServicesByOrganizationUseCase {
  constructor(@Inject('ServiceRepository') private serviceRepository: ServiceRepository) {}

  async execute(organizationCnpj: string): Promise<Service[]> {
    return this.serviceRepository.findByOrganization(organizationCnpj);
  }
} 