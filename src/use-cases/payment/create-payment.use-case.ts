import { Inject } from '@nestjs/common';
import { Payment } from '../../entities/payment';
import type { PaymentRepository } from '../../repositories/payment.repository';
import { CreatePaymentDto } from '../../dto/create-payment.dto';
import type { OrganizationRepository } from '../../repositories/organization.repository';
import { SendMessage } from '../../services/notification.service';

export class CreatePaymentUseCase {
  constructor(
    @Inject('PaymentRepository') private paymentRepository: PaymentRepository,
    @Inject('OrganizationRepository')
    private organizationRepository: OrganizationRepository,
  ) {}

  async execute(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    try {
      if (!createPaymentDto.subscription) {
        throw new Error('Pagamento sem assinatura vinculada não pode ser registrado');
      }

      const organization = await this.organizationRepository.findByCustomer(
        createPaymentDto.customer,
      );

      const organizationCnpj: string = organization?.cnpj ?? '';

      const payment = Payment.create({
        id: createPaymentDto.id,
        dateCreated: createPaymentDto.dateCreated,
        customer: createPaymentDto.customer,
        organizationCnpj: organizationCnpj,
        subscriptionId: createPaymentDto.subscription!,
        dueDate: createPaymentDto.dueDate,
        originalDueDate: createPaymentDto.originalDueDate,
        value: createPaymentDto.value,
        netValue: createPaymentDto.netValue,
        billingType: createPaymentDto.billingType,
        status: createPaymentDto.status,
        originalValue: createPaymentDto.originalValue,
        invoiceUrl: createPaymentDto.invoiceUrl,
        transactionReceiptUrl: createPaymentDto.transactionReceiptUrl,
      });

      const existingPayment = await this.paymentRepository.findById(payment.id);

      if (existingPayment) {
        return await this.paymentRepository.update(payment);
      } else {
        return await this.paymentRepository.create(payment);
      }
    } catch (error) {
      console.error('Erro ao criar/atualizar pagamento:', error);
      SendMessage('Erro ao criar/atualizar pagamento', error.message, '10');
      throw error;
    }
  }
}
