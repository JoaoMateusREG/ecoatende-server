import { User } from '../../entities/user';
import type { UserRepository } from '../../repositories/user.repository';
import { Inject } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

export class UpdateUserUseCase {
  constructor(
    @Inject('UserRepository') private userRepository: UserRepository,
  ) {}

  async execute(user: User, requestingUserCpf?: string): Promise<User> {
    const currentUser = await this.userRepository.findByCpf(user.cpf);
    if (!currentUser) {
      throw new Error('Usuário não encontrado');
    }

    // Se foi fornecido o CPF de quem está fazendo a requisição, verifica permissão
    if (requestingUserCpf) {
      const requestingUser =
        await this.userRepository.findByCpf(requestingUserCpf);

      if (!requestingUser) {
        throw new Error('Usuário solicitante não encontrado');
      }

      // Verifica permissões baseado no role
      if (requestingUser.role === 'USER') {
        // USER só pode editar a si mesmo
        if (requestingUser.cpf !== user.cpf) {
          throw new Error('Você não tem permissão para editar outros usuários');
        }
      }

      if (requestingUser.role === 'ORGANIZATION_ADMIN') {
        // ORGANIZATION_ADMIN só pode editar usuários da própria organização
        if (requestingUser.organizationCnpj !== currentUser.organizationCnpj) {
          throw new Error(
            'Você só pode editar usuários da sua própria organização',
          );
        }
        if (currentUser.role == 'ADMIN') {
          throw new Error(
            'Você não tem permissão para editar adiministradores',
          );
        }
      }

      // ADMIN pode editar qualquer usuário (sem restrições)
    }

    if (user.password && user.password !== currentUser.password) {
      try {
        const isCurrentPassword = await bcrypt.compare(
          user.password,
          currentUser.password,
        );
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
