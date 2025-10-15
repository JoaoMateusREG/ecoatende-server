import { Inject } from '@nestjs/common';
import type { PaymentRepository } from '../../repositories/payment.repository';

export class DeletePaymentUseCase {
  constructor(
    @Inject('PaymentRepository')
    private paymentRepository: PaymentRepository,
  ) {}

  async execute(id: string): Promise<void> {
    return this.paymentRepository.delete(id);
  }
}
