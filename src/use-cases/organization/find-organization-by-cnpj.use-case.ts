import { Organization } from "../../entities/organization";
import type { OrganizationRepository } from "../../repositories/organization.repository";
import { Inject } from "@nestjs/common";

export class FindOrganizationByCnpjUseCase {
  constructor(@Inject('OrganizationRepository') private organizationRepository: OrganizationRepository) {}

  async execute(cnpj: string): Promise<Organization | null> {
    return this.organizationRepository.findByCnpj(cnpj);
  }
} 