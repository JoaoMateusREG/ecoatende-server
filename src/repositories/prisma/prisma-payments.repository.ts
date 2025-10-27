import { prisma } from '../../infra/prisma/client';
import { PaymentRepository } from '../payment.repository';
import { Payment } from '../../entities/payment';
import { Subscription } from '../../entities/subscription';
import { Organization } from 'src/entities/organization';

export class PrismaPaymentsRepository implements PaymentRepository {
  async create(payment: Payment): Promise<Payment> {
    const created = await prisma.payment.create({
      data: {
        id: payment.id,
        dateCreated: payment.dateCreated,
        customer: payment.customer,
        organizationCnpj: payment.organizationCnpj,
        subscriptionId: payment.subscriptionId,
        dueDate: payment.dueDate,
        originalDueDate: payment.originalDueDate,
        value: payment.value,
        netValue: payment.netValue,
        billingType: payment.billingType,
        status: payment.status,
        invoiceUrl:payment.invoiceUrl,
        transactionReceiptUrl: payment.transactionReceiptUrl,
      },
    });
    return this.mapToEntity(created);
  }

  async update(payment: Payment): Promise<Payment> {
    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        dueDate: payment.dueDate,
        originalDueDate: payment.originalDueDate,
        value: payment.value,
        netValue: payment.netValue,
        billingType: payment.billingType,
        status: payment.status,
        invoiceUrl:payment.invoiceUrl,
        transactionReceiptUrl: payment.transactionReceiptUrl,
      },
    });
    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.payment.delete({ where: { id } });
  }

  async findById(id: string): Promise<Payment | null> {
    const payment = await prisma.payment.findUnique({
      where: { id },
    });
    return payment ? this.mapToEntity(payment) : null;
  }

  async findBySubscription(subscriptionId: string): Promise<Payment[]> {
    const payments = await prisma.payment.findMany({
      where: { subscriptionId },
    });
    return payments.map(this.mapToEntity);
  }

  async findByCustomer(customerId: string): Promise<Payment[]> {
    const payments = await prisma.payment.findMany({
      where: { customer: customerId },
    });
    return payments.map(this.mapToEntity);
  }

  public mapToEntity = (data: any): Payment => {
    return Payment.create({
      id: data.id,
      dateCreated: data.dateCreated,
      customer: data.customer,
      organization: data.organization?.map((organization:any) => 
      Organization.create({
        cnpj: organization.cnpj,
        name: organization.name,
        email: organization.email,
        phone: organization.phone,
        customerId: organization.customerId,
      })),
      organizationCnpj: data.organizationCnpj,
      subscription: data.subscription?.map((subsctiption: any) => 
        Subscription.create ({
        id: subsctiption.id,
        dateCreated: subsctiption.dateCreated,
        customer: subsctiption.customer,
        value: subsctiption.value,
        nextDueDate: subsctiption.nextDueDate,
        cycle: subsctiption.cycle,
        billingType: subsctiption.billingType,
        status: subsctiption.status,
        organizationCnpj: subsctiption.organizationCnpj,
      }),
    ),
      subscriptionId: data.subscriptionId,
      dueDate: data.dueDate,
      originalDueDate: data.originalDueDate,
      value: data.value,
      netValue: data.netValue,
      billingType: data.billingType,
      status: data.status,
      originalValue: data.originalValue,
      invoiceUrl: data.invoiceUrl,
      transactionReceiptUrl: data.transactionReceiptUrl,
    });
  };
}
