import type { UserRepository } from '../../repositories/user.repository';
import { Inject } from '@nestjs/common';

export class DeleteUserUseCase {
  constructor(
    @Inject('UserRepository') private userRepository: UserRepository,
  ) {}

  async execute(cpf: string, requestingUserCpf?: string): Promise<void> {
    const userToDelete = await this.userRepository.findByCpf(cpf);

    if (!userToDelete) {
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
        throw new Error('Você não tem permissão para deletar usuários');
      }

      if (requestingUser.role === 'ORGANIZATION_ADMIN') {
        // ORGANIZATION_ADMIN só pode deletar usuários da própria organização
        if (requestingUser.organizationCnpj !== userToDelete.organizationCnpj) {
          throw new Error(
            'Você só pode deletar usuários da sua própria organização',
          );
        }
      }

      // ADMIN pode deletar qualquer usuário (sem restrições)
    }

    return this.userRepository.delete(cpf);
  }
}
