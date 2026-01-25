import type { OrganizationRepository } from '../../repositories/organization.repository';
import type { UserRepository } from '../../repositories/user.repository';
import { Inject } from '@nestjs/common';
import { UserRole } from '../../utils/user-role';

export class DeleteOrganizationUseCase {
  constructor(
    @Inject('OrganizationRepository')
    private organizationRepository: OrganizationRepository,
    @Inject('UserRepository') private userRepository: UserRepository,
  ) {}

  async execute(cnpj: string, requestingUserCpf?: string): Promise<void> {
    const organizationToDelete =
      await this.organizationRepository.findByCnpj(cnpj);

    if (!organizationToDelete) {
      throw new Error('Organização não encontrada');
    }

    // Se foi fornecido o CPF de quem está fazendo a requisição, verifica permissão
    if (requestingUserCpf) {
      const requestingUser =
        await this.userRepository.findByCpf(requestingUserCpf);

      if (!requestingUser) {
        throw new Error('Usuário solicitante não encontrado');
      }

      // Apenas ADMIN pode deletar organizações
      if (requestingUser.role !== UserRole.ADMIN) {
        throw new Error('Você não tem permissão para deletar organizações');
      }
    }

    return this.organizationRepository.delete(cnpj);
  }
}
