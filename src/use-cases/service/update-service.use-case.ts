import { Service } from '../../entities/service';
import type { ServiceRepository } from '../../repositories/service.repository';
import type { UserRepository } from '../../repositories/user.repository';
import { UpdateServiceDto } from '../../dto/update-service.dto';
import { Inject } from '@nestjs/common';

export class UpdateServiceUseCase {
  constructor(
    @Inject('ServiceRepository') private serviceRepository: ServiceRepository,
    @Inject('UserRepository') private userRepository: UserRepository,
  ) {}

  async execute(
    updateServiceDto: UpdateServiceDto & { id: number },
    requestingUserCpf?: string,
  ): Promise<Service> {
    // Busca o serviço existente
    const existingService = await this.serviceRepository.findById(
      updateServiceDto.id,
    );
    if (!existingService) {
      throw new Error('Serviço não encontrado');
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
        throw new Error('Você não tem permissão para atualizar serviços');
      }

      if (requestingUser.role === 'ORGANIZATION_ADMIN') {
        // ORGANIZATION_ADMIN só pode atualizar serviços da própria organização
        if (
          requestingUser.organizationCnpj !== existingService.organizationCnpj
        ) {
          throw new Error(
            'Você só pode atualizar serviços da sua própria organização',
          );
        }
      }

      // ADMIN pode atualizar serviços de qualquer organização (sem restrições)
    }

    // Se foram fornecidos CPFs de usuários (mesmo que vazio), processa a associação
    if (updateServiceDto.userCpfs !== undefined) {
      await this.validateAndAssociateUsers(
        updateServiceDto.userCpfs,
        existingService.organizationCnpj,
        updateServiceDto.id,
      );
    }

    // Atualiza apenas os campos fornecidos
    const updatedService = Service.create({
      ...existingService,
      ...updateServiceDto,
    });

    return this.serviceRepository.update(updatedService);
  }

  private async validateAndAssociateUsers(
    userCpfs: string[],
    organizationCnpj: string,
    serviceId: number,
  ): Promise<void> {
    // Se o array está vazio, apenas remove todas as associações
    if (userCpfs.length === 0) {
      await this.serviceRepository.associateUsers(serviceId, []);
      return;
    }

    // Busca todos os usuários da organização
    const organizationUsers =
      await this.userRepository.findByOrganization(organizationCnpj);
    const organizationUserCpfs = organizationUsers.map((user) => user.cpf);

    // Valida se todos os CPFs fornecidos pertencem à organização
    const invalidCpfs = userCpfs.filter(
      (cpf) => !organizationUserCpfs.includes(cpf),
    );
    if (invalidCpfs.length > 0) {
      throw new Error(
        `Os seguintes usuários não pertencem à organização: ${invalidCpfs.join(', ')}`,
      );
    }

    // Associa os usuários ao serviço
    await this.serviceRepository.associateUsers(serviceId, userCpfs);
  }
}
