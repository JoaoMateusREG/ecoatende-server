import { Service } from '../../entities/service';
import type { ServiceRepository } from '../../repositories/service.repository';
import type { UserRepository } from '../../repositories/user.repository';
import { Inject } from '@nestjs/common';
import { UserRole } from '../../utils/user-role';

export class FindServicesByOrganizationUseCase {
  constructor(
    @Inject('ServiceRepository') private serviceRepository: ServiceRepository,
    @Inject('UserRepository') private userRepository: UserRepository,
  ) {}

  async execute(
    organizationCnpj: string,
    requestingUserCpf?: string,
  ): Promise<Service[]> {
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
        // USER e ORGANIZATION_ADMIN só podem listar serviços da própria organização
        if (requestingUser.organizationCnpj !== organizationCnpj) {
          throw new Error(
            'Você só pode listar serviços da sua própria organização',
          );
        }
      }

      // ADMIN pode listar serviços de qualquer organização (sem restrições)
    }

    return this.serviceRepository.findByOrganization(organizationCnpj);
  }
}
