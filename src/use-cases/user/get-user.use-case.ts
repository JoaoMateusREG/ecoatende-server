import { User } from '../../entities/user';
import type { UserRepository } from '../../repositories/user.repository';
import { Inject } from '@nestjs/common';
import { UserRole } from '../../utils/user-role';

export class GetUserUseCase {
  constructor(
    @Inject('UserRepository') private userRepository: UserRepository,
  ) {}

  async execute(cpf: string, requestingUserCpf?: string): Promise<User | null> {
    const user = await this.userRepository.findByCpf(cpf);

    if (!user) {
      return null;
    }

    // Se foi fornecido o CPF de quem está fazendo a requisição, verifica permissão
    if (requestingUserCpf) {
      const requestingUser =
        await this.userRepository.findByCpf(requestingUserCpf);

      if (!requestingUser) {
        throw new Error('Usuário solicitante não encontrado');
      }

      // Verifica permissões baseado no role
      if (requestingUser.role === UserRole.USER) {
        // USER só pode ver a si mesmo
        if (requestingUser.cpf !== cpf) {
          throw new Error(
            'Você não tem permissão para visualizar outros usuários',
          );
        }
      }

      if (requestingUser.role === UserRole.ORGANIZATION_ADMIN) {
        // ORGANIZATION_ADMIN só pode ver usuários da própria organização
        if (requestingUser.organizationCnpj !== user.organizationCnpj) {
          throw new Error(
            'Você só pode visualizar usuários da sua própria organização',
          );
        }
      }

      // ADMIN pode ver qualquer usuário (sem restrições)
    }

    return user;
  }
}
