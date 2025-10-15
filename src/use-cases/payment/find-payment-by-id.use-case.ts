import { Inject } from "@nestjs/common";
import type { PaymentRepository } from "../../repositories/payment.repository";
import { Payment } from "../../entities/payment";

export class FindPaymentByIdUseCase {
  constructor(
    @Inject('PaymentRepository')
    private paymentRepository: PaymentRepository,
  ) {}
  
  async execute(id: string): Promise<Payment | null> {
    return this.paymentRepository.findById(id);
  }
}