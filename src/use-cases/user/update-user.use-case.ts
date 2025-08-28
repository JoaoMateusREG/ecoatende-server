import { User } from "../../entities/user";
import type { UserRepository } from "../../repositories/user.repository";
import { Inject } from "@nestjs/common";
import * as bcrypt from 'bcryptjs';

export class UpdateUserUseCase {
  constructor(@Inject('UserRepository') private userRepository: UserRepository) {}

  async execute(user: User): Promise<User> {
    const currentUser = await this.userRepository.findByCpf(user.cpf);
    if (!currentUser) {
      throw new Error("Usuário não encontrado");
    }

    if (user.password && user.password !== currentUser.password) {
      try {
        const isCurrentPassword = await bcrypt.compare(user.password, currentUser.password);
        if (!isCurrentPassword) {
          user.password = await bcrypt.hash(user.password, 10);
        } else {
          user.password = currentUser.password;
        }
      } catch (error) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    } else if (!user.password) {
      user.password = currentUser.password;
    }

    return this.userRepository.update(user);
  }
} 