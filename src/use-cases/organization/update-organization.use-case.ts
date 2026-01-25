import { Organization } from '../../entities/organization';
import type { OrganizationRepository } from '../../repositories/organization.repository';
import type { UserRepository } from '../../repositories/user.repository';
import { UpdateOrganizationDto } from '../../dto/update-organization.dto';
import { Inject } from '@nestjs/common';
import { UserRole } from '../../utils/user-role';

export class UpdateOrganizationUseCase {
  constructor(
    @Inject('OrganizationRepository')
    private organizationRepository: OrganizationRepository,
    @Inject('UserRepository') private userRepository: UserRepository,
  ) {}

  async execute(
    updateOrganizationDto: UpdateOrganizationDto & { cnpj: string },
    requestingUserCpf?: string,
  ): Promise<Organization> {
    // Busca a organização existente
    const existingOrganization = await this.organizationRepository.findByCnpj(
      updateOrganizationDto.cnpj,
    );
    if (!existingOrganization) {
      throw new Error('Organização não encontrada');
    }

    // Se foi fornecido o CPF de quem está fazendo a requisição, verifica permissão
    if (requestingUserCpf) {
      const requestingUser =
        await this.userRepository.findByCpf(requestingUserCpf);

      if (!requestingUser) {
        throw new Error('Usuário solicitante não encontrado');
      }

      // Verifica permissões baseado no role
      if (requestingUser.role === UserRole.USER) {
        throw new Error('Você não tem permissão para atualizar organizações');
      }

      if (requestingUser.role === UserRole.ORGANIZATION_ADMIN) {
        // ORGANIZATION_ADMIN só pode atualizar a própria organização
        if (requestingUser.organizationCnpj !== updateOrganizationDto.cnpj) {
          throw new Error('Você só pode atualizar sua própria organização');
        }
      }

      // ADMIN pode atualizar qualquer organização (sem restrições)
    }

    // Atualiza apenas os campos fornecidos
    const updatedOrganization = Organization.create({
      ...existingOrganization,
      ...updateOrganizationDto,
    });

    return this.organizationRepository.update(updatedOrganization);
  }
}
