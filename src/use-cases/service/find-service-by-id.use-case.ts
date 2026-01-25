import { Service } from '../../entities/service';
import type { ServiceRepository } from '../../repositories/service.repository';
import type { UserRepository } from '../../repositories/user.repository';
import { Inject } from '@nestjs/common';
import { UserRole } from '../../utils/user-role';

export class FindServiceByIdUseCase {
  constructor(
    @Inject('ServiceRepository') private serviceRepository: ServiceRepository,
    @Inject('UserRepository') private userRepository: UserRepository,
  ) {}

  async execute(
    id: number,
    requestingUserCpf?: string,
  ): Promise<Service | null> {
    const service = await this.serviceRepository.findById(id);

    if (!service) {
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
        // USER e ORGANIZATION_ADMIN só podem ver serviços da própria organização
        if (requestingUser.organizationCnpj !== service.organizationCnpj) {
          throw new Error(
            'Você só pode visualizar serviços da sua própria organização',
          );
        }
      }

      // ADMIN pode ver serviços de qualquer organização (sem restrições)
    }

    return service;
  }
}
