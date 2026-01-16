import { Organization } from '../../entities/organization';
import type { OrganizationRepository } from '../../repositories/organization.repository';
import type { UserRepository } from '../../repositories/user.repository';
import { Inject } from '@nestjs/common';

export class FindAllOrganizationsUseCase {
  constructor(
    @Inject('OrganizationRepository')
    private organizationRepository: OrganizationRepository,
    @Inject('UserRepository') private userRepository: UserRepository,
  ) {}

  async execute(requestingUserCpf?: string): Promise<Organization[]> {
    // Se foi fornecido o CPF de quem está fazendo a requisição, filtra por permissão
    if (requestingUserCpf) {
      const requestingUser =
        await this.userRepository.findByCpf(requestingUserCpf);

      if (!requestingUser) {
        throw new Error('Usuário solicitante não encontrado');
      }

      // Verifica permissões baseado no role
      if (
        requestingUser.role === 'USER' ||
        requestingUser.role === 'ORGANIZATION_ADMIN'
      ) {
        // USER e ORGANIZATION_ADMIN só podem ver a própria organização
        const organization = await this.organizationRepository.findByCnpj(
          requestingUser.organizationCnpj,
        );
        return organization ? [organization] : [];
      }

      // ADMIN pode ver todas as organizações
    }

    return this.organizationRepository.findAll();
  }
}
