import { User } from "../../entities/user";
import type { UserRepository } from "../../repositories/user.repository";
import { Inject } from "@nestjs/common";

export class AuthenticateUserUseCase {
  constructor(@Inject('UserRepository') private userRepository: UserRepository) {}

  async execute(cpf: string, password: string): Promise<User | null> {
    return this.userRepository.findByCpfAndPassword(cpf, password);
  }
} 