import { Inject } from '@nestjs/common';
import { Payment } from '../../entities/payment';
import type { PaymentRepository } from '../../repositories/payment.repository';
import { CreatePaymentDto } from '../../dto/create-payment.dto';
import type { OrganizationRepository } from '../../repositories/organization.repository';
import type { SubscriptionRepository } from '../../repositories/subscription.repository';
import { SendMessage } from '../../services/notification.service';
import { calculateNextBillingDate } from '../../utils/date.utils';

export class CreatePaymentUseCase {
  constructor(
    @Inject('PaymentRepository') private paymentRepository: PaymentRepository,
    @Inject('OrganizationRepository')
    private organizationRepository: OrganizationRepository,
    @Inject('SubscriptionRepository')
    private subscriptionRepository: SubscriptionRepository,
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

      let savedPayment: Payment;
      if (existingPayment) {
        savedPayment = await this.paymentRepository.update(payment);
      } else {
        savedPayment = await this.paymentRepository.create(payment);
      }

      // Update subscription's nextDueDate if applicable
      const subscription = await this.subscriptionRepository.findById(payment.subscriptionId);
      if (subscription && payment.dueDate) {
        const calculatedNextDate = calculateNextBillingDate(subscription.dateCreated, payment.dueDate);
        
        // Only update if the newly calculated date is strictly after the current nextDueDate
        const currentNextDate = new Date(subscription.nextDueDate);
        const newNextDate = new Date(calculatedNextDate);
        
        if (newNextDate > currentNextDate) {
          subscription.nextDueDate = calculatedNextDate;
          await this.subscriptionRepository.update(subscription);
        }
      }

      return savedPayment;
    } catch (error: any) {
      console.error('Erro ao criar/atualizar pagamento:', error);
      SendMessage('Erro ao criar/atualizar pagamento', error.message, '10');
      throw error;
    }
  }
}
