import { User } from "../../entities/user";
import type { UserRepository } from "../../repositories/user.repository";
import { Inject } from "@nestjs/common";

export class ListUsersUseCase {
  constructor(@Inject('UserRepository') private userRepository: UserRepository) {}

  async execute(): Promise<User[]> {
    return this.userRepository.findActive();
  }
} 