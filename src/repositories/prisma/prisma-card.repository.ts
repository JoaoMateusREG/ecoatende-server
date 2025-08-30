import { prisma } from "../../infra/prisma/client";
import { CardRepository } from "../card.repository";
import { Card } from "../../entities/card";
import { Service } from "../../entities/service";
import { Organization } from "../../entities/organization";
import { User } from "../../entities/user";

export class PrismaCardRepository implements CardRepository {
  async create(card: Card): Promise<Card> {
    const created = await prisma.card.create({
      data: {
        card: card.card,
        serviceId: card.serviceId,
        priority: card.priority,
        status: card.status,
        datehour: card.datehour,
        datehourAttend: card.datehourAttend,
        concluded: card.concluded,
        datehourConcluded: card.datehourConcluded,
        organizationCnpj: card.organizationCnpj,
        userCpf: card.userCpf
      },
      include: {
        service: true
      },
    });

    return this.mapToEntity(created);
  }

  async update(card: Card): Promise<Card> {
    const updated = await prisma.card.update({
      where: { id: card.id },
      data: {
        card: card.card,
        serviceId: card.serviceId,
        priority: card.priority,
        status: card.status,
        datehour: card.datehour,
        datehourAttend: card.datehourAttend,
        concluded: card.concluded,
        datehourConcluded: card.datehourConcluded,
        organizationCnpj: card.organizationCnpj,
        userCpf: card.userCpf
      }
    });

    return this.mapToEntity(updated);
  }

  async delete(id: number): Promise<void> {
    await prisma.card.delete({ where: { id } });
  }

  async deleteByServiceId(serviceId: number): Promise<void> {
    await prisma.card.deleteMany({ where: { serviceId } });
  }

  async findById(id: number): Promise<Card | null> {
    const card = await prisma.card.findUnique({
      where: { id },
      include: {
        service: true,
        organization: true
      },
    });

    return card ? this.mapToEntity(card) : null;
  }

  async findByServiceId(serviceId: number): Promise<Card[]> {
    const cards = await prisma.card.findMany({
      where: { serviceId },
      include: {
        service: true,
        organization: true
      },
    });

    return cards.map(this.mapToEntity);
  }

  async findByNumberAndDate(cardNumber: string, date: Date): Promise<Card | null> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const card = await prisma.card.findFirst({
      where: {
        card: cardNumber,
        datehour: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        service: true,
        organization: true
      },
    });

    return card ? this.mapToEntity(card) : null;
  }

  async findTodayConcluded(organizationCnpj: string): Promise<Card[]> {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const cards = await prisma.card.findMany({
      where: { status: 'FINISHED', organizationCnpj: organizationCnpj, datehourConcluded: {
        gte: startOfDay,
        lte: endOfDay
      } },
      include: {
        service: true,
        organization: true
      },
    });

    return cards.map(this.mapToEntity);
  }

  async countByServiceAndDate(serviceId: number, date: Date): Promise<number> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await prisma.card.count({
      where: {
        serviceId,
        datehour: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });
  }

  async findLastCardByServiceAndDate(serviceId: number, date: Date): Promise<Card | null> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const card = await prisma.card.findFirst({
      where: {
        serviceId,
        datehour: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      orderBy: {
        card: 'desc'
      },
      include: {
        service: true,
        organization: true
      },
    });

    return card ? this.mapToEntity(card) : null;
  }

  async findPendingByServices(serviceIds?: number[]): Promise<Card[]> {
    const where: any = { status: 'WAITING' };
    
    if (serviceIds && serviceIds.length > 0) {
      where.serviceId = { in: serviceIds };
    }

    const cards = await prisma.card.findMany({
      where,
      include: {
        service: true,
        organization: true
      },
    });

    return cards.map(this.mapToEntity);
  }

  async countPendingByOrganization(organizationCnpj: string): Promise<number> {
    const where: any = { status: 'WAITING' };
    
    where.organizationCnpj = organizationCnpj;

    return await prisma.card.count({
      where
    });
  }

  async findTodayCreatedByOrganizationAndService(organizationCnpj: string, serviceId: number): Promise<Card[]> {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const cards = await prisma.card.findMany({
      where: { organizationCnpj, serviceId, datehour: { gte: startOfDay, lte: endOfDay } },
      include: { service: true, organization: true }
    });

    return cards.map(this.mapToEntity);
  }

  async findInAttendanceByServices(serviceIds?: number[]): Promise<Card[]> {
    const where: any = { status: 'IN_ATTENDANCE' };
    
    if (serviceIds && serviceIds.length > 0) {
      where.serviceId = { in: serviceIds };
    }

    const cards = await prisma.card.findMany({
      where,
      include: {
        service: true,
        organization: true
      },
    });

    return cards.map(this.mapToEntity);
  }

  async findTodayCalledByOrganization(organizationCnpj: string): Promise<Card[]> {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const cards = await prisma.card.findMany({
      where: {
        organizationCnpj: organizationCnpj,
        status: { in: ['CALLED', 'IN_ATTENDANCE', 'FINISHED'] },
        datehourAttend: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        service: true,
        organization: true
      },
    });

    return cards.map(this.mapToEntity);
  }

  async countConcludedTodayByOrganization(organizationCnpj: string): Promise<number> {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    return await prisma.card.count({
      where: {
        organizationCnpj: organizationCnpj,
        status: 'FINISHED',
        datehourConcluded: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });
  }

  async countInAttendanceByOrganization(organizationCnpj: string): Promise<number> {
    return await prisma.card.count({
      where: {
        organizationCnpj: organizationCnpj,
        status: 'IN_ATTENDANCE'
      }
    });
  }

  async getAverageWaitTime(organizationCnpj: string, startDate: Date, endDate: Date, serviceId?: number): Promise<number> {
    const where: any = {
      organizationCnpj: organizationCnpj,
      status: { in: ['CALLED', 'IN_ATTENDANCE', 'FINISHED'] },
      datehour: {
        gte: startDate,
        lte: endDate
      },
      datehourAttend: {
        not: null
      }
    };

    if (serviceId) {
      where.serviceId = serviceId;
    }

    const cards = await prisma.card.findMany({
      where,
      select: {
        datehour: true,
        datehourAttend: true
      }
    });

    if (cards.length === 0) {
      return 0;
    }

    const totalWaitTime = cards.reduce((total, card) => {
      if (!card.datehourAttend) return total;
      const waitTime = card.datehourAttend.getTime() - card.datehour.getTime();
      return total + waitTime;
    }, 0);

    return Math.round(totalWaitTime / cards.length / (1000 * 60)); // Retorna em minutos
  }

  async getAverageServiceTime(organizationCnpj: string, startDate: Date, endDate: Date, serviceId?: number): Promise<number> {
    const where: any = {
      organizationCnpj: organizationCnpj,
      status: 'FINISHED',
      datehourAttend: {
        gte: startDate,
        lte: endDate
      },
      datehourConcluded: {
        not: null
      }
    };

    if (serviceId) {
      where.serviceId = serviceId;
    }

    const cards = await prisma.card.findMany({
      where,
      select: {
        datehourAttend: true,
        datehourConcluded: true
      }
    });

    if (cards.length === 0) {
      return 0;
    }

    const totalServiceTime = cards.reduce((total, card) => {
      if (!card.datehourConcluded || !card.datehourAttend) return total;
      const serviceTime = card.datehourConcluded.getTime() - card.datehourAttend.getTime();
      return total + serviceTime;
    }, 0);

    return Math.round(totalServiceTime / cards.length / (1000 * 60)); // Retorna em minutos
  }

  async getCompletedCardsCount(organizationCnpj: string, startDate: Date, endDate: Date, serviceId?: number): Promise<number> {
    const where: any = {
      organizationCnpj: organizationCnpj,
      status: 'FINISHED',
      datehourConcluded: {
        gte: startDate,
        lte: endDate
      }
    };

    if (serviceId) {
      where.serviceId = serviceId;
    }

    return await prisma.card.count({ where });
  }

  public mapToEntity = (data: any): Card => {
    return Card.create({
      id: data.id,
      card: data.card,
      serviceId: data.serviceId,
      priority: data.priority,
      status: data.status,
      datehour: data.datehour,
      datehourAttend: data.datehourAttend,
      concluded: data.concluded,
      datehourConcluded: data.datehourConcluded,
      organizationCnpj: data.organizationCnpj,
      userCpf: data.userCpf,
      service: data.service ? Service.create({
        id: data.service.id,
        name: data.service.name,
        prefix: data.service.prefix,
        organizationCnpj: data.service.organizationCnpj,
        canCreateCards: data.service.canCreateCards,
        category: data.service.category ?? undefined,
        color: data.service.color ?? undefined
      }) : undefined,
      organization: data.organization ? Organization.create({
        cnpj: data.organization.cnpj,
        name: data.organization.name,
        active: data.organization.active
      }) : undefined,
      user: data.user ? User.create({
        cpf: data.user.cpf,
        name: data.user.name,
        password: data.user.password,
        role: data.user.role,
        organizationCnpj: data.user.organizationCnpj,
        isActive: data.user.isActive,
        picture: data.user.picture
      }) : undefined
    });
  };
} 