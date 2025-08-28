import { Organization } from "../../entities/organization";
import type { OrganizationRepository } from "../../repositories/organization.repository";
import { Inject } from "@nestjs/common";

export class FindAllOrganizationsUseCase {
  constructor(@Inject('OrganizationRepository') private organizationRepository: OrganizationRepository) {}

  async execute(): Promise<Organization[]> {
    return this.organizationRepository.findAll();
  }
} 