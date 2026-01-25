import { Organization } from '../../entities/organization';
import type { OrganizationRepository } from '../../repositories/organization.repository';
import type { UserRepository } from '../../repositories/user.repository';
import { Inject } from '@nestjs/common';
import { UserRole } from '../../utils/user-role';

export class FindOrganizationByCnpjUseCase {
  constructor(
    @Inject('OrganizationRepository')
    private organizationRepository: OrganizationRepository,
    @Inject('UserRepository') private userRepository: UserRepository,
  ) {}

  async execute(
    cnpj: string,
    requestingUserCpf?: string,
  ): Promise<Organization | null> {
    const organization = await this.organizationRepository.findByCnpj(cnpj);

    if (!organization) {
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
      if (
        requestingUser.role === UserRole.USER ||
        requestingUser.role === UserRole.ORGANIZATION_ADMIN
      ) {
        // USER e ORGANIZATION_ADMIN só podem ver a própria organização
        if (requestingUser.organizationCnpj !== cnpj) {
          throw new Error('Você só pode visualizar sua própria organização');
        }
      }

      // ADMIN pode ver qualquer organização (sem restrições)
    }

    return organization;
  }
}
