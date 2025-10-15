import { Inject } from "@nestjs/common";
import type { PaymentRepository } from "../../repositories/payment.repository";
import { Payment } from "../../entities/payment";

export class FindPaymentBySubscriptionUseCase {
  constructor(
    @Inject('PaymentRepository')
    private paymentRepository: PaymentRepository,
  ) {}
  
  async execute(subscriptionId: string): Promise<Payment[] | null> {
    return this.paymentRepository.findBySubscription(subscriptionId);
  }
}