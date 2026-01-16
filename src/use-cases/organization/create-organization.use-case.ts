import { Organization } from '../../entities/organization';
import type { OrganizationRepository } from '../../repositories/organization.repository';
import type { UserRepository } from '../../repositories/user.repository';
import { CreateOrganizationDto } from '../../dto/create-organization.dto';
import { Inject } from '@nestjs/common';

export class CreateOrganizationUseCase {
  constructor(
    @Inject('OrganizationRepository')
    private organizationRepository: OrganizationRepository,
    @Inject('UserRepository') private userRepository: UserRepository,
  ) {}

  async execute(
    createOrganizationDto: CreateOrganizationDto,
    requestingUserCpf?: string,
  ): Promise<Organization> {
    // Se foi fornecido o CPF de quem está fazendo a requisição, verifica permissão
    if (requestingUserCpf) {
      const requestingUser =
        await this.userRepository.findByCpf(requestingUserCpf);

      if (!requestingUser) {
        throw new Error('Usuário solicitante não encontrado');
      }

      // Apenas ADMIN pode criar organizações
      if (requestingUser.role !== 'ADMIN') {
        throw new Error('Você não tem permissão para criar organizações');
      }
    }

    // Cria a entidade Organization a partir do DTO
    const organization = Organization.create({
      cnpj: createOrganizationDto.cnpj,
      name: createOrganizationDto.name,
      email: createOrganizationDto.email,
      phone: createOrganizationDto.phone,
      customerId: createOrganizationDto.customerId,
      creationDate: new Date(),
      active: createOrganizationDto.active,
      logo: createOrganizationDto.logo,
    });

    return this.organizationRepository.create(organization);
  }
}
