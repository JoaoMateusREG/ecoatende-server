import { User } from "../../entities/user";
import type { UserRepository } from "../../repositories/user.repository";
import { Inject } from "@nestjs/common";

export class FindUsersByOrganizationUseCase {
  constructor(@Inject('UserRepository') private userRepository: UserRepository) {}

  async execute(organizationCnpj: string): Promise<User[]> {
    return this.userRepository.findByOrganization(organizationCnpj);
  }
} 