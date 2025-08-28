import { User } from "../../entities/user";
import type { UserRepository } from "../../repositories/user.repository";
import { ChangePasswordDto } from "../../dto/change-password.dto";
import { isValidCPF } from "../../utils/cpf-validator";
import * as bcrypt from 'bcryptjs';
import { Inject } from "@nestjs/common";

export class ChangePasswordUseCase {
  constructor(@Inject('UserRepository') private userRepository: UserRepository) {}

  async execute(changePasswordDto: ChangePasswordDto & { cpf: string }): Promise<void> {
    // Valida o CPF
    if (!isValidCPF(changePasswordDto.cpf)) {
      throw new Error("CPF inválido");
    }

    // Busca o usuário
    const user = await this.userRepository.findByCpf(changePasswordDto.cpf);
    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    // Verifica a senha atual
    const isCurrentPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new Error("Senha atual incorreta");
    }

    // Hash da nova senha
    const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    // Atualiza a senha
    const updatedUser = User.create({
      ...user,
      password: hashedNewPassword,
    });

    await this.userRepository.update(updatedUser);
  }
} 