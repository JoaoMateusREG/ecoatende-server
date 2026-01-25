import { User } from '../../entities/user';
import type { UserRepository } from '../../repositories/user.repository';
import { Inject } from '@nestjs/common';
import { UserRole } from '../../utils/user-role';

export class ListUsersUseCase {
  constructor(
    @Inject('UserRepository') private userRepository: UserRepository,
  ) {}

  async execute(requestingUserCpf?: string): Promise<User[]> {
    // Se foi fornecido o CPF de quem está fazendo a requisição, filtra por permissão
    if (requestingUserCpf) {
      const requestingUser =
        await this.userRepository.findByCpf(requestingUserCpf);

      if (!requestingUser) {
        throw new Error('Usuário solicitante não encontrado');
      }

      // Verifica permissões baseado no role
      if (requestingUser.role === UserRole.USER) {
        // USER só pode ver a si mesmo
        return [requestingUser];
      }

      if (requestingUser.role === UserRole.ORGANIZATION_ADMIN) {
        // ORGANIZATION_ADMIN só pode ver usuários da própria organização
        return this.userRepository.findByOrganization(
          requestingUser.organizationCnpj,
        );
      }

      // ADMIN pode ver todos os usuários
    }

    return this.userRepository.findActive();
  }
}
