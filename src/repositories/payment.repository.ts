import { Payment } from "src/entities/payment";

export interface PaymentRepository {
  create(payment: Payment): Promise<Payment>;
  update(payment: Payment): Promise<Payment>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Payment | null>;
  findBySubscription(subscriptionId: string): Promise<Payment[]>;
  findByCustomer(customerId: string): Promise<Payment[]>;
  mapToEntity(data: any): Payment;
}