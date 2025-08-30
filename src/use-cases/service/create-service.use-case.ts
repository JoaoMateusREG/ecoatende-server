import { Service } from "../../entities/service";
import type { ServiceRepository } from "../../repositories/service.repository";
import { CreateServiceDto } from "../../dto/create-service.dto";
import { Inject } from "@nestjs/common";

export class CreateServiceUseCase {
  constructor(@Inject('ServiceRepository') private serviceRepository: ServiceRepository) {}

  async execute(createServiceDto: CreateServiceDto): Promise<Service> {
    // Cria a entidade Service a partir do DTO
    const service = Service.create({
      id: 0, // Será gerado pelo banco de dados
      name: createServiceDto.name,
      prefix: createServiceDto.prefix,
      organizationCnpj: createServiceDto.organizationCnpj,
      category: createServiceDto.category ?? undefined,
      color: createServiceDto.color ?? undefined,
      canCreateCards: createServiceDto.canCreateCards ?? true
    });

    return this.serviceRepository.create(service);
  }
} 