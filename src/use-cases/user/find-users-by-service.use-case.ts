import { User } from '../../entities/user';
import type { UserRepository } from '../../repositories/user.repository';
import { Inject } from '@nestjs/common';

export class FindUsersByServiceUseCase {
  constructor(
    @Inject('UserRepository') private userRepository: UserRepository,
  ) {}

  async execute(serviceId: number): Promise<User[]> {
    return this.userRepository.findByService(serviceId);
  }
}
