import { Service } from '../../entities/service';
import type { ServiceRepository } from '../../repositories/service.repository';
import type { UserRepository } from '../../repositories/user.repository';
import { CreateServiceDto } from '../../dto/create-service.dto';
import { Inject } from '@nestjs/common';
import { UserRole } from '../../utils/user-role';

export class CreateServiceUseCase {
  constructor(
    @Inject('ServiceRepository') private serviceRepository: ServiceRepository,
    @Inject('UserRepository') private userRepository: UserRepository,
  ) {}

  async execute(
    createServiceDto: CreateServiceDto,
    requestingUserCpf?: string,
  ): Promise<Service> {
    // Se foi fornecido o CPF de quem está fazendo a requisição, verifica permissão
    if (requestingUserCpf) {
      const requestingUser =
        await this.userRepository.findByCpf(requestingUserCpf);

      if (!requestingUser) {
        throw new Error('Usuário solicitante não encontrado');
      }

      // Verifica permissões baseado no role
      if (requestingUser.role === UserRole.USER) {
        throw new Error('Você não tem permissão para criar serviços');
      }

      if (requestingUser.role === UserRole.ORGANIZATION_ADMIN) {
        // ORGANIZATION_ADMIN só pode criar serviços na própria organização
        if (
          requestingUser.organizationCnpj !== createServiceDto.organizationCnpj
        ) {
          throw new Error(
            'Você só pode criar serviços na sua própria organização',
          );
        }
      }

      // ADMIN pode criar serviços em qualquer organização (sem restrições)
    }

    // Cria a entidade Service a partir do DTO
    const service = Service.create({
      id: 0, // Será gerado pelo banco de dados
      name: createServiceDto.name,
      prefix: createServiceDto.prefix,
      organizationCnpj: createServiceDto.organizationCnpj,
      type: createServiceDto.type,
      cardLimit: createServiceDto.cardLimit ?? 150,
      category: createServiceDto.category ?? undefined,
      color: createServiceDto.color ?? undefined,
      canCreateCards: createServiceDto.canCreateCards ?? true,
    });

    return this.serviceRepository.create(service);
  }
}
