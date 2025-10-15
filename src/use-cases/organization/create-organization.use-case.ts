import { Organization } from "../../entities/organization";
import type { OrganizationRepository } from "../../repositories/organization.repository";
import { CreateOrganizationDto } from "../../dto/create-organization.dto";
import { Inject } from "@nestjs/common";

export class CreateOrganizationUseCase {
  constructor(@Inject('OrganizationRepository') private organizationRepository: OrganizationRepository) {}

  async execute(createOrganizationDto: CreateOrganizationDto): Promise<Organization> {
    // Cria a entidade Organization a partir do DTO
    const organization = Organization.create({
      cnpj: createOrganizationDto.cnpj,
      name: createOrganizationDto.name,
      customerId: createOrganizationDto.customerId,
      creationDate: new Date(),
      active: createOrganizationDto.active,
      logo: createOrganizationDto.logo
    });

    return this.organizationRepository.create(organization);
  }
} 