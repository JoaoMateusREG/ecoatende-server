import { Inject } from '@nestjs/common';
import { Payment } from '../../entities/payment';
import type { PaymentRepository } from '../../repositories/payment.repository';
import { CreatePaymentDto } from '../../dto/create-payment.dto';
import type { OrganizationRepository } from '../../repositories/organization.repository';

export class CreatePaymentUseCase {
  constructor(
    @Inject('PaymentRepository') private paymentRepository: PaymentRepository,
    @Inject('OrganizationRepository') private organizationRepository: OrganizationRepository,
  ) {}

  async execute(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const organization = await this.organizationRepository.findByCustomer(
      createPaymentDto.customer,
    );

    const organizationCnpj: string = organization?.cnpj ?? '';

    const payment = Payment.create({
      id: createPaymentDto.id,
      dateCreated: createPaymentDto.dateCreated,
      customer: createPaymentDto.customer,
      organizationCnpj: organizationCnpj,
      subscriptionId: createPaymentDto.subscription,
      dueDate: createPaymentDto.dueDate,
      originalDueDate: createPaymentDto.originalDueDate,
      value: createPaymentDto.value,
      netValue: createPaymentDto.netValue,
      billingType: createPaymentDto.billingType,
      status: createPaymentDto.status,
      originalValue: createPaymentDto.originalValue,
      transactionReceiptUrl: createPaymentDto.transactionReceiptUrl,
    });

    // 🔍 Verifica se já existe um pagamento com esse ID
    const existingPayment = await this.paymentRepository.findById(payment.id);

    if (existingPayment) {
      // ✅ Atualiza o registro existente
      return await this.paymentRepository.update(payment);
    } else {
      // 🆕 Cria um novo pagamento
      return await this.paymentRepository.create(payment);
    }
  }
}
