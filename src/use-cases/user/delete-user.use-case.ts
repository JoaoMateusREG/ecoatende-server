import type { UserRepository } from "../../repositories/user.repository";
import { Inject } from "@nestjs/common";

export class DeleteUserUseCase {
  constructor(@Inject('UserRepository') private userRepository: UserRepository) {}

  async execute(cpf: string): Promise<void> {
    return this.userRepository.delete(cpf);
  }
} 