import { prisma } from "src/infra/prisma/client";
import { SubscriptionRepository } from "../subscription.repository";
import { Subscription } from "../../entities/subscription";
import { Organization } from "src/entities/organization";
import { Payment } from "src/entities/payment";

export class PrismaSubscriptionRepository implements SubscriptionRepository {
  async create(subscription: Subscription): Promise<Subscription> {
    const created = await prisma.subscription.create({
      data: {
        id: subscription.id,
        dateCreated: subscription.dateCreated,
        customer: subscription.customer,
        value: subscription.value,
        nextDueDate: subscription.nextDueDate,
        cycle: subscription.cycle,
        billingType: subscription.billingType,
        status: subscription.status,
        organizationCnpj: subscription.organizationCnpj,
      },
    });
    return this.mapToEntity(created);
  }

  async update(subscription: Subscription): Promise<Subscription> {
    const updated = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        value: subscription.value,
        nextDueDate: subscription.nextDueDate,
        cycle: subscription.cycle,
        billingType: subscription.billingType,
        status: subscription.status,
      },
    });
    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.subscription.delete({ where: { id } });
  }

  async findById(id: string): Promise<Subscription | null> {
    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        organization: true,
        payments: true,
      },
    });
    return subscription ? this.mapToEntity(subscription) : null;
  }

  async findByOrganization(organizationCnpj: string): Promise<Subscription[]> {
    const subscriptions = await prisma.subscription.findMany({
      where: { organizationCnpj },
      include: {
        organization: true,
        payments: true,
      },
    });
    return subscriptions.map(this.mapToEntity);
  }

  async findByStatus(status: string): Promise<Subscription[]> {
    const subscriptions = await prisma.subscription.findMany({
      where: { status },
      include: {
        organization: true,
        payments: true,
      },
    });
    return subscriptions.map(this.mapToEntity);
  }

  async findByCustomer(customerId: string): Promise<Subscription[]> {
    const subscriptions = await prisma.subscription.findMany({
      where: { customer: customerId },
      include: {
        organization: true,
        payments: true,
      },
    });
    return subscriptions.map(this.mapToEntity);
  }

  mapToEntity(data: any): Subscription {
    return Subscription.create({
      id: data.id,
      dateCreated: data.dateCreated,
      customer: data.customer,
      value: data.value,
      nextDueDate: data.nextDueDate,
      cycle: data.cycle,
      billingType: data.billingType,
      status: data.status,
      organizationCnpj: data.organizationCnpj,
      organization: data.organization?.map((organization: any) => 
        Organization.create({
        cnpj: organization.cnpj,
        name: organization.name,
      }),
    ),
      payments: data.payments?.map((payment: any) => 
        Payment.create({
        id: payment.id,
        dateCreated: payment.dateCreated,
        customer: payment.customer,
        organizationCnpj: payment.organizationCnpj,
        subscription: payment.subscription?.map((subsctiption: any) => 
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
        subscriptionId: payment.subscriptionId,
        dueDate: payment.dueDate,
        originalDueDate: payment.originalDueDate,
        value: payment.value,
        netValue: payment.netValue,
        originalValue: payment.originalValue? payment.originalValue : undefined,
        billingType: payment.billingType,
        status: payment.status,
        transactionReceiptUrl: payment.transactionReceiptUrl,
      }),
    ),
    });
  }
}