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

  async execute(createpaymentDto: CreatePaymentDto): Promise<Payment> {

    const organization = await this.organizationRepository.findByCustomer(
      createpaymentDto.customer,
    );
    const organizationCnpj: string = organization?.cnpj ?? '';

    const payment = Payment.create({
      id: createpaymentDto.id,
      dateCreated: createpaymentDto.dateCreated,
      customer: createpaymentDto.customer,
      organizationCnpj: organizationCnpj,
      subscriptionId: createpaymentDto.subscription,
      dueDate: createpaymentDto.dueDate,
      originalDueDate: createpaymentDto.originalDueDate,
      value: createpaymentDto.value,
      netValue: createpaymentDto.netValue,
      billingType: createpaymentDto.billingType,
      status: createpaymentDto.status,
      originalValue: createpaymentDto.originalValue,
      transactionReceiptUrl: createpaymentDto.transactionReceiptUrl,
    });

    return await this.paymentRepository.create(payment);
  }
}
