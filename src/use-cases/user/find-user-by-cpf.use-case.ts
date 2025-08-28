import { User } from "../../entities/user";
import type { UserRepository } from "../../repositories/user.repository";
import { Inject } from "@nestjs/common";

export class FindUserByCpfUseCase {
  constructor(@Inject('UserRepository') private userRepository: UserRepository) {}

  async execute(cpf: string): Promise<User | null> {
    return this.userRepository.findByCpf(cpf);
  }
} 