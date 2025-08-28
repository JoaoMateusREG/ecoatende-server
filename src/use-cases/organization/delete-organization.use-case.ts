import type { OrganizationRepository } from "../../repositories/organization.repository";
import { Inject } from "@nestjs/common";

export class DeleteOrganizationUseCase {
  constructor(@Inject('OrganizationRepository') private organizationRepository: OrganizationRepository) {}

  async execute(cnpj: string): Promise<void> {
    return this.organizationRepository.delete(cnpj);
  }
} 