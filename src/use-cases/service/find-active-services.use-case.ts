import { Service } from '../../entities/service';
import type { ServiceRepository } from '../../repositories/service.repository';
import { Inject } from '@nestjs/common';

export class FindActiveServicesUseCase {
  constructor(
    @Inject('ServiceRepository') private serviceRepository: ServiceRepository,
  ) {}

  async execute(): Promise<Service[]> {
    return this.serviceRepository.findActive();
  }
}
