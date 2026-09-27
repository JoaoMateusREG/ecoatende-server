import { prisma } from '../../infra/prisma/client';
import { OrganizationRepository } from '../organization.repository';
import { Organization } from '../../entities/organization';
import { User } from '../../entities/user';
import { Service } from '../../entities/service';
import { Payment } from '../../entities/payment';
import { Subscription } from '../../entities/subscription';

export class PrismaOrganizationRepository implements OrganizationRepository {
  async create(organization: Organization): Promise<Organization> {
    const created = await prisma.organization.create({
      data: {
        cnpj: organization.cnpj,
        name: organization.name,
        email: organization.email,
        phone: organization.phone,
        customerId: organization.customerId,
        active: organization.active,
        logo: organization.logo,
        gracePeriodDays: organization.gracePeriodDays,
      },
    });

    return this.mapToEntity(created);
  }

  async update(organization: Organization): Promise<Organization> {
    const updated = await prisma.organization.update({
      where: { cnpj: organization.cnpj },
      data: {
        name: organization.name,
        email: organization.email,
        phone: organization.phone,
        customerId: organization.customerId,
        active: organization.active,
        logo: organization.logo,
        gracePeriodDays: organization.gracePeriodDays,
      },
    });

    return this.mapToEntity(updated);
  }

  async delete(cnpj: string): Promise<void> {
    await prisma.organization.delete({ where: { cnpj } });
  }

  async findByCnpj(cnpj: string): Promise<Organization | null> {
    const organization = await prisma.organization.findUnique({
      where: { cnpj },
      select: {
        cnpj: true,
        name: true,
        email: true,
        phone: true,
        creationDate: true,
        customerId: true, // Need customerId for subscription creation!
        active: true,
        subscription: {
          select: {
            id: true,
            dateCreated: true,
            customer: true,
            value: true,
            nextDueDate: true,
            cycle: true,
            billingType: true,
            status: true,
            organizationCnpj: true,
          }
        },
        payments: {
          select: {
            id: true,
            dueDate: true,
            value: true,
            billingType: true,
            status: true,
            transactionReceiptUrl: true,
            invoiceUrl: true,
            originalValue: true,
            netValue: true,
            originalDueDate: true,
          }
        },
      },
    });

    return organization ? this.mapToEntity(organization) : null;
  }

  async findByName(name: string): Promise<Organization | null> {
    const organization = await prisma.organization.findFirst({
      where: { name },
    });

    return organization ? this.mapToEntity(organization) : null;
  }

  async findAll(): Promise<Organization[]> {
    const organizations = await prisma.organization.findMany({
      select: {
        cnpj: true,
        name: true,
        email: true,
        phone: true,
        active: true,
        logo: true,
        gracePeriodDays: true,
      },
    });

    return organizations.map(this.mapToEntity);
  }

  async findFirst(): Promise<Organization | null> {
    const organization = await prisma.organization.findFirst({});

    return organization ? this.mapToEntity(organization) : null;
  }

  async findWithUsers(cnpj: string): Promise<Organization | null> {
    const organization = await prisma.organization.findUnique({
      where: { cnpj },
      select: {
        cnpj: true,
        name: true,
        users: {
          select: {
            cpf: true,
            name: true,
            role: true,
            isActive: true,
            organizationCnpj: true,
            picture: true, // picture is used in some components maybe? It doesn't hurt.
          },
        },
        services: {
          select: {
            id: true,
            name: true,
            prefix: true,
            organizationCnpj: true,
            users: {
              select: {
                cpf: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
    });

    return organization ? this.mapToEntity(organization) : null;
  }

  async findWithServices(cnpj: string): Promise<Organization | null> {
    const organization = await prisma.organization.findUnique({
      where: { cnpj },
      select: {
        cnpj: true,
        name: true,
        services: {
          select: {
            id: true,
            name: true,
            prefix: true,
            organizationCnpj: true,
            type: true,
            category: true,
            color: true,
            canCreateCards: true,
            cardLimit: true,
            users: {
              select: {
                cpf: true,
                name: true,
                role: true,
              },
            },
          },
        },
        users: {
          select: {
            cpf: true,
            name: true,
            role: true,
            isActive: true,
          },
        },
      },
    });

    return organization ? this.mapToEntity(organization) : null;
  }

  async findWithCards(cnpj: string): Promise<Organization | null> {
    const organization = await prisma.organization.findUnique({
      where: { cnpj },
      select: {
        cnpj: true,
        name: true,
        cards: {
          take: 1000,
          orderBy: { datehour: 'desc' },
          select: {
            id: true,
            card: true,
            datehour: true,
            priority: true,
            status: true,
          },
        },
      },
    });

    return organization ? this.mapToEntity(organization) : null;
  }

  async findByCustomer(customerId: string): Promise<Organization | null> {
    const organization = await prisma.organization.findUnique({
      where: { customerId },
    });
    return organization ? this.mapToEntity(organization) : null;
  }

  public mapToEntity = (data: any): Organization => {
    return Organization.create({
      cnpj: data.cnpj,
      name: data.name,
      email: data.email,
      phone: data.phone,
      customerId: data.customerId,
      creationDate: data.creationDate,
      gracePeriodDays: data.gracePeriodDays,
      users: data.users?.map((user: any) =>
        User.create({
          cpf: user.cpf,
          name: user.name,
          password: user.password,
          role: user.role,
          organizationCnpj: user.organizationCnpj,
          isActive: user.isActive,
          picture: user.picture,
        }),
      ),
      services: data.services?.map((service: any) =>
        Service.create({
          id: service.id,
          name: service.name,
          prefix: service.prefix,
          organizationCnpj: service.organizationCnpj,
          type: service.type,
          category: service.category ?? undefined,
          color: service.color ?? undefined,
          canCreateCards: service.canCreateCards,
          cardLimit: service.cardLimit ?? undefined,
          users: service.users ?? [],
        }),
      ),
      payments: data.payments?.map((payment: any) =>
        Payment.create({
          id: payment.id,
          dateCreated: payment.dateCreated,
          customer: payment.customer,
          organizationCnpj: payment.organizationCnpj,
          subscriptionId: payment.subscriptionId,
          dueDate: payment.dueDate,
          originalDueDate: payment.originalDueDate,
          value: payment.value,
          netValue: payment.netValue,
          originalValue: payment.originalValue ? payment.originalValue : null,
          billingType: payment.billingType,
          status: payment.status,
          invoiceUrl: payment.invoiceUrl,
          transactionReceiptUrl: payment.transactionReceiptUrl,
        }),
      ),
      subscription: data.subscription?.map((subscription: any) =>
        Subscription.create({
          id: subscription.id,
          dateCreated: subscription.dateCreated,
          customer: subscription.customer,
          value: subscription.value,
          nextDueDate: subscription.nextDueDate,
          cycle: subscription.cycle,
          billingType: subscription.billingType,
          status: subscription.status,
          organizationCnpj: subscription.organizationCnpj,
        }),
      ),
    });
  };
}
