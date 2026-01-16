import type { ServiceRepository } from '../../repositories/service.repository';
import type { CardRepository } from '../../repositories/card.repository';
import type { UserRepository } from '../../repositories/user.repository';
import { Inject } from '@nestjs/common';

export class DeleteServiceUseCase {
  constructor(
    @Inject('ServiceRepository') private serviceRepository: ServiceRepository,
    @Inject('CardRepository') private cardRepository: CardRepository,
    @Inject('UserRepository') private userRepository: UserRepository,
  ) {}

  async execute(id: number, requestingUserCpf?: string): Promise<void> {
    const serviceToDelete = await this.serviceRepository.findById(id);

    if (!serviceToDelete) {
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
        throw new Error('Você não tem permissão para deletar serviços');
      }

      if (requestingUser.role === 'ORGANIZATION_ADMIN') {
        throw new Error('Você não tem permissão para deletar serviços');
      }

      // Apenas ADMIN pode deletar serviços
    }

    // Primeiro deleta todas as fichas associadas ao serviço
    await this.cardRepository.deleteByServiceId(id);

    // Depois deleta o serviço
    await this.serviceRepository.delete(id);
  }
}
