import { Organization } from "../../entities/organization";
import type { OrganizationRepository } from "../../repositories/organization.repository";
import { UpdateOrganizationDto } from "../../dto/update-organization.dto";
import { Inject } from "@nestjs/common";

export class UpdateOrganizationUseCase {
  constructor(@Inject('OrganizationRepository') private organizationRepository: OrganizationRepository) {}

  async execute(updateOrganizationDto: UpdateOrganizationDto & { cnpj: string }): Promise<Organization> {
    // Busca a organização existente
    const existingOrganization = await this.organizationRepository.findByCnpj(updateOrganizationDto.cnpj);
    if (!existingOrganization) {
      throw new Error("Organização não encontrada");
    }

    console.log(updateOrganizationDto)

    // Atualiza apenas os campos fornecidos
    const updatedOrganization = Organization.create({
      ...existingOrganization,
      ...updateOrganizationDto
    });

    return this.organizationRepository.update(updatedOrganization);
  }
} 