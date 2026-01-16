import { Service } from '../../entities/service';
import type { ServiceRepository } from '../../repositories/service.repository';
import { Inject } from '@nestjs/common';

export class FindServicesByUserUseCase {
  constructor(
    @Inject('ServiceRepository') private serviceRepository: ServiceRepository,
  ) {}

  async execute(userCpf: string): Promise<Service[]> {
    return this.serviceRepository.findByUser(userCpf);
  }
}
