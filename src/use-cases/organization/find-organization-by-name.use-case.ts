import { Organization } from "../../entities/organization";
import type { OrganizationRepository } from "../../repositories/organization.repository";
import { Inject } from "@nestjs/common";

export class FindOrganizationByNameUseCase {
  constructor(@Inject('OrganizationRepository') private organizationRepository: OrganizationRepository) {}

  async execute(name: string): Promise<Organization | null> {
    return this.organizationRepository.findByName(name);
  }
} 